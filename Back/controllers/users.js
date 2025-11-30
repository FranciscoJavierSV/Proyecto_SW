const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Importar modelos 
const {
  createUser,
  findEmail,
  findUser,
  updatePassword,
  updateUserCountry,
  updateUserFontSize,
  updateUserContrast,
  updateLoginAttempts,
  resetAttempts,
  blockUser,
  getUserById
} = require('../models/users');

// ENV
const JWT_SECRET = process.env.JWT_SECRET;
const FRONT_URL = process.env.FRONT_URL;

// ======================================================
// LOGIN
// ======================================================
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos' });
    }

    const user = await findUser(correo);

    // Usuario no existe
    if (!user) {
      return res.status(401).json({ success: false, message: 'Datos inválidos' });
    }

    // Revisar si está bloqueado
    if (user.block && new Date(user.block) > new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta bloqueada temporalmente. Intenta más tarde.'
      });
    }

    // Comparar contraseña
    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordMatch) {

      const newAttempts = user.intentos + 1;
      await updateLoginAttempts(user.id, newAttempts);

      // Bloquear si pasa 5 intentos
      if (newAttempts >= 5) {
        await blockUser(user.id);
        return res.status(403).json({
          success: false,
          message: 'Cuenta bloqueada por demasiados intentos. Intenta en 15 minutos.'
        });
      }

      return res.status(401).json({ success: false, message: 'Datos inválidos' });
    }

    // Si inició sesión exitosamente, resetear intentos
    await resetAttempts(user.id);

    // Crear Access Token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.nombre,
        rol: user.rol,
        pais_id: user.pais_id || user.pais,
        fontSize: user.font,
        contrast: user.contrast
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.nombre,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ======================================================
// REGISTRO
// ======================================================
const newUser = async (req, res) => {
  try {
    const { username, contrasena, correo, pais } = req.body;

    if (!username || !contrasena || !correo || !pais) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    const emailExists = await findEmail(correo);
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Correo ya registrado' });
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    const preferencias = JSON.stringify({
        fontSize: "12",
        contrast: "white"
    });

    const user = {
      username,
      contrasena: hashed,
      correo,
      pais_id: pais,
      preferencias
    };

    // crea usuario en BD
    const success = await createUser(user);

    if (!success) {
      return res.status(500).json({ success: false, message: 'Error al crear usuario' });
    }

    return res.status(200).json({ success: true, message: 'Usuario registrado con éxito' });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ======================================================
// RECUPERAR CONTRASEÑA
// ======================================================
const recoveryUser = async (req, res) => {
  try {
    const { correo, captchaT } = req.body;

    if (!captchaT) {
      return res.status(400).json({ success: false, message: 'Completa el captcha' });
    }

    if (!correo) {
      return res.status(400).json({ success: false, message: 'Ingresa el correo' });
    }

    const user = await findEmail(correo);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Correo no registrado' });
    }

    const token = jwt.sign(
      { id: user.id, correo: user.correo },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    const link = `${FRONT_URL}/reset?token=${token}`;

    return res.status(200).json({
      success: true,
      message: 'Correo enviado',
      debugLink: process.env.NODE_ENV === 'development' ? link : undefined
    });

  } catch (error) {
    console.error('Error recovery:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ======================================================
// EDITAR USUARIO
// ======================================================
const editUser = async (req, res) => {
  try {
    const { type, value } = req.body;
    const userId = req.user.id;

    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    if (type === 'pais') {
      await updateUserCountry(userId, value);
      return res.json({ success: true, message: 'País actualizado' });
    }

    if (type === 'fontSize') {
      await updateUserFontSize(userId, value);
      return res.json({ success: true, message: 'Tamaño de letra actualizado' });
    }

    if (type === 'contrast') {
      await updateUserContrast(userId, value);
      return res.json({ success: true, message: 'Contraste actualizado' });
    }

    return res.status(400).json({ success: false, message: 'Tipo de edición inválido' });

  } catch (error) {
    console.error('Error editUser:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================
const restore = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const hashed = await bcrypt.hash(newPassword, 10);
    await updatePassword(payload.id, hashed);

    return res.json({ success: true, message: 'Contraseña actualizada' });

  } catch (error) {
    console.error('Error restore:', error);
    return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
  }
};

// ======================================================
// LOGOUT
// ======================================================
const logout = async (req, res) => {
  return res.json({ success: true, message: 'Sesión cerrada' });
};

// ======================================================
// REFRESH TOKEN
// ======================================================
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No hay refresh token' });
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: payload.id, username: payload.username, rol: payload.rol },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    return res.json({ success: true, token: newAccessToken });
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Refresh token inválido' });
  }
};

module.exports = {
  login,
  newUser,
  recoveryUser,
  restore,
  editUser,
  logout,
  refresh
};
