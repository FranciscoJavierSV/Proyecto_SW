// usar el jwt
const jwt = require('jsonwebtoken');
// es para la encriptacion de las contrasenas 
const bcrypt = require('bcrypt');
// usar los metodos que se comunican con la base de datos
const {
  createUser,
  findEmail,
  findUser,
  updatePassword,
  updateUserCountry,
  updateUserFontSize,
  updateUserContrast,
  incrementFailedAttempt,
  resetFailedAttempts,
  lockUserUntil,
  // cambiado: importar el nombre que exporta el modelo
  getUserById
} = require('../models/users');

// palabra oculta
const JWT_SECRET = process.env.JWT_SECRET;
const FRONT_URL = process.env.FRONT_URL || 'http://localhost:4000';

// Intentos y bloqueo
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// autentica usuario y genera tokens
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    
    // error: falta correo o contraseña
    if (!correo || !contrasena) {
      return res.status(400).json({ 
        success:false, 
        message:'Usuario y contraseña son requeridos' 
      });
    }

    // busca usuario por correo
    const user = await findUser(correo);
    
    // error: usuario no existe
    if (!user) {
      return res.status(401).json({ 
        success:false, 
        message:'Datos inválidos' 
      });
    }

    // error: cuenta bloqueada por intentos fallidos
    if (user.block && new Date(user.block) > new Date()) {
      return res.status(423).json({ 
        success:false, 
        message:`Cuenta bloqueada hasta ${new Date(user.block).toLocaleString()}` 
      });
    }

    // compara contraseña
    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      // incrementa intentos fallidos
      const attempts = await incrementFailedAttempt(user.id);
      
      // error: supera máximo de intentos, bloquea cuenta
      if (attempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        await lockUserUntil(user.id, lockUntil);
        return res.status(423).json({ 
          success:false, 
          message:`Cuenta bloqueada temporalmente. Intente nuevamente después de ${lockUntil.toLocaleString()}` 
        });
      }
      
      // error: contraseña incorrecta
      return res.status(401).json({ 
        success:false, 
        message:'Datos inválidos', 
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attempts) 
      });
    }

    // éxito: resetea intentos y genera tokens
    await resetFailedAttempts(user.id);
    
    // genera access token (corta duración)
    const accessToken = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // genera refresh token (larga duración)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || JWT_SECRET,
      { expiresIn: '7d' }
    );

    // devolver ambos tokens en el body (cliente guardará refresh en localStorage)
    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token: accessToken,
      refreshToken,
      user: { id: user.id, nombre: user.nombre }
    });

  } catch (error) {
    // error: fallo en el servidor
    console.error(error);
    return res.status(500).json({ 
      success:false, 
      message:'Error en el servidor' 
    });
  }
};

// registra nuevo usuario
const newUser = async (req, res ) => {
  const { username, contrasena, correo, pais } = req.body;
  try{
    // error: faltan campos obligatorios
    if (!username || !contrasena || !correo || !pais) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: username, password, correo, pais'
      });
    }

    // verifica que el correo no exista
    const correoB = await findEmail(correo);
    
    // error: correo ya está registrado
    if (correoB) {
      return res.status(401).json({
        success: false,
        message: 'Correo ya registrado'
      });
    }

    // encripta la contraseña
    const hashed = await bcrypt.hash(contrasena, 10);
    
    // valores por defecto para accesibilidad
    const text = "12";
    const contrast = "white";

    const user = {username, contrasena: hashed, correo, text, contrast, pais};

    // crea usuario en BD
    const success = await createUser(user);
    
    // error: fallo al crear usuario en BD
    if(!success){
      return res.status(500).json({
        success: false,
        message: 'Error de creacion, intente mas tarde'
      });
    }

    return res.status(200).json({
      success: true,
      message: ' Usuario Registrado con exito ',
    });
    
  }catch(error){
    // error: fallo en el servidor
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

// inicia recuperación de contraseña
const recoveryUser = async (req, res ) => {
  const { correo, captchaT } = req.body;
  try{
    // error: captcha no completado
    if(!captchaT){
      return res.status(401).json({
        success: false,
        message: 'Completa el captcha para continuar'
      });
    }
    
    // error: falta correo
    if(!correo){
      return res.status(401).json({
        success: false,
        message: 'Ingrese el correo en el campo'
      });
    }

    // busca usuario por correo
    const user = await findEmail(correo);
    
    // error: correo no registrado
    if(!user){
      return res.status(404).json({
        success: false,
        message: 'Correo no registrado'
      });
    }

    // genera token JWT corto (5 minutos)
    const token = jwt.sign({ id: user.id, correo: user.correo }, JWT_SECRET, { expiresIn: '5m' });
    const link = `${FRONT_URL}/reset?token=${token}`;

    // TODO: enviar link por correo
    // await sendRecoveryEmail(user.correo, link);

    return res.status(200).json({
      success: true,
      message: 'Email de recuperación enviado',
      debugLink: process.env.NODE_ENV === 'development' ? link : undefined
    });

  }catch(error){
    // error: fallo en el servidor
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

// actualiza preferencias de accesibilidad
const editUser = async (req, res ) => {
  const { type, value } = req.body;
  const userId = req.user.id; // viene del middleware

  try {
    // error: faltan datos
    if (!type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Falta de datos'
      });
    }

    // actualiza según el tipo
    if (type === 'pais') {
      await updateUserCountry(userId, value);
      return res.status(200).json({ success: true, message: 'País actualizado' });
    }

    if (type === 'fontSize') {
      await updateUserFontSize(userId, value);
      return res.status(200).json({ success: true, message: 'Preferencia de tamaño de letra actualizada' });
    }

    if (type === 'contrast') {
      await updateUserContrast(userId, value);
      return res.status(200).json({ success: true, message: 'Brillo actualizado' });
    }

    // error: type desconocido
    return res.status(400).json({ success: false, message: 'Tipo de edición inválido' });

  }catch(error){
    // error: fallo en el servidor
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

// cambia contraseña con token de recuperación
const restore = async (req, res) => {
  const {token, newPassword} = req.body;
  try{
    // error: faltan token o nueva contraseña
    if(!token || !newPassword){
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos' 
      });
    }

    // verifica token JWT
    const payload = jwt.verify(token, JWT_SECRET);
    
    // encripta nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);
    
    // actualiza en BD
    await updatePassword(payload.id, hashed);

    return res.status(200).json({ 
      success: true, 
      message: 'Contraseña actualizada' 
    });

  }catch(error){
    // error: token inválido o expirado
    console.error('Error restore:', error);
    return res.status(400).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
};

// nuevo endpoint: recibe refreshToken en body y devuelve nuevo access token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success:false, message:'Falta refresh token' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success:false, message:'Refresh token inválido o expirado' });
    }

    // obtener usuario por id usando el nombre correcto
    const user = await getUserById(payload.id);
    if (!user) return res.status(404).json({ success:false, message:'Usuario no encontrado' });

    const newAccess = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ success:true, token: newAccess, user: { id: user.id, nombre: user.nombre } });
  } catch (error) {
    console.error('Error refresh:', error);
    return res.status(500).json({ success:false, message:'Error en el servidor' });
  }
};

// nuevo: logout simple (no guarda refresh en BD)
const logout = async (req, res) => {
  try {
    // si llegara a usarse cookie en el futuro, limpiar:
    try { res.clearCookie && res.clearCookie('refreshToken'); } catch (e) {}
    return res.status(200).json({ success: true, message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error logout:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = {
  login, newUser, recoveryUser, editUser, restore, refresh, logout
};