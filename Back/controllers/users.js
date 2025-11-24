// usar el jwt
const jwt = require('jsonwebtoken');
// es para la encriptacion de las contrasenas 
const bcrypt = require('bcrypt');
// usar los metodos que se comunican con las base de datos
const {
  createUser,
  findEmail,
  findUser,
  updatePassword,
  saveRefreshToken,
  updateUserCountry,
  updateUserFontSize,
  updateUserContrast,
  deleteRefreshToken
} = require('../models/users');

// palabra oculta
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const FRONT_URL = 'http://localhost:4000'; //process.env.FRONT_URL  cambiar por estouna vez este el link del front
                                           // en el .env


const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    // Comprueba si ingresaron datos
    if (!correo || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // obtiene el usuario de la base de datos
    const user = await findUser(correo);

    // Si no existe el usuario o la contraseña no coincide, falla sin especificar
    const passwordMatch = user ? await bcrypt.compare(contrasena, user.contrasena) : false;
    if (!user || !passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Datos inválidos'
      });
    }
    // se genera el token (access token corto)
    const token = jwt.sign(
      {
        username: user.nombre,
        role: user.rol,
        id: user.id,
        pais: user.pais,
        fontSize: user.font,
        contrast: user.contrast
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // se genera refresh token (sesiones más largas)
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // opcional: guardar refresh token en BD para poder invalidarlo
    try { if (saveRefreshToken) await saveRefreshToken(user.id, refreshToken); } catch (e) { /* no bloquear login si falla */ }

    // intentar enviar refresh token como cookie httpOnly si está disponible
    try {
      if (res.cookie) {
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
      }
    } catch (e) { /* ignorar si no está configurado */ }

    // regresa si fue exitoso 
    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      refreshToken, // si no quieres exponerlo en body, elimina esta linea y usa solo la cookie
      user: {
        username: user.nombre,
        role: user.rol
      }
    });
    // envia mensaje de error del servidor 
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

const newUser = async (req, res ) => {
  const { username, contrasena, correo, pais } = req.body;
  // Agregar la logica de almacenar los usuarios a la base de datos
  try{
  // Validar campos obligatorios
    if (!username || !contrasena || !correo || !pais) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: username, password, correo, pais'
      });
    }

  const correoB = await findEmail(correo);
  // Consultar si el correo existe para evitar duplicados
  if (correoB) {
      return res.status(401).json({
        success: false,
        message: 'Correo ya registrado'
      });
    }
  // Si no esta el correo registrado continuar con el registro
  // asignar conf basica de accesibilidad
    // Encriptar la contraseña antes de guardar
    const hashed = await bcrypt.hash(contrasena, 10);
    // Agregar campos genericos (accesibilidad, id , etc...)
    const text = "12"
    const contrast = "white"

    const user = {username, contrasena: hashed, correo, text, contrast, pais};

    const success = await createUser(user);

    if(!success){
      return res.status(500).json({
        success: false,
        message: 'Error de creacion, intente mas tarde'
      });
    }

  // una vez agregado
  return res.status(200).json({
      success: true,
      message: ' Usuario Registrado con exito ',
    });
  // En caso de error de conexion
  }catch(error){
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

const recoveryUser = async (req, res ) => {
  // esto viene despues decompletar el captcha y agregar el correo a recuperar
  const { correo, captchaT } = req.body;
  // Aqui el recuperar usuario
  try{
    // Verificar que llego el captcha
    if(!captchaT){
      return res.status(401).json({
        success: false,
        message: 'Completa el captcha para continuar'
      });
    }
    // Verificar que llego el correo
    if(!correo){
      return res.status(401).json({
        success: false,
        message: 'Ingrese el correo en el campo'
      });
    }
    // logica de recuperar contrasena 
    //buscar usuario
    const user = await findEmail(correo);
    if(!user){
      return res.status(404).json({
        success: false,
        message: 'Correo no registrado'
      });
    }

    // generar token de corta duracion para recuperación
    const token = jwt.sign({ id: user.id, correo: user.correo }, JWT_SECRET, { expiresIn: '5m' });
    const link = `${FRONT_URL}/reset?token=${token}`;

    // enviar correo con url y token de expiracion para el cambio de contra
    // TODO: implementar sendRecoveryEmail(user.correo, link);

    return res.status(200).json({
      success: true,
      message: 'Email de recuperación enviado',
      // por seguridad no devolver el link en producción; útil para pruebas:
      debugLink: process.env.NODE_ENV === 'development' ? link : undefined
    });

  // si no retorna un error   
  }catch(error){
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

const editUser = async (req, res ) => {
  const { type, value } = req.body;
  const userId = req.user.id; // viene del middleware

  // revisa si estan los datos disponibles
  try {
    if (!type || !value) {
      return res.status(400).json({
        success: false,
        message: 'Falta de datos'
      });
    }
    // logica para cada tipo de request

    // Cambiar país del usuario
    if (type === 'pais') {
      await updateUserCountry(userId, value);
      return res.status(200).json({ success: true, message: 'País actualizado' });
    }

    // Cambiar tamaño de letra del usuario
    if (type === 'fontSize') {
      await updateUserFontSize(userId, value);
      return res.status(200).json({ success: true, message: 'Preferencia de tamaño de letra actualizada' });
    }

    // Cambiar contraste del usuario
    if (type === 'contrast') {
      await updateUserContrast(userId, value);
      return res.status(200).json({ success: true, message: 'Brillo actualizado ' });
    }
    // si llega un type desconocido
    return res.status(400).json({ success: false, message: 'Tipo de edición inválido' });

  // si no retorna un error 
  }catch(error){
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

const restore = async (req, res) => {
// token que expira para el cambio enviado por la url
 const {token, newPassword} = req.body;
try{
  if(!token || !newPassword){
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }
  // verificar token
  const payload = jwt.verify(token, JWT_SECRET);
  // encriptar nueva contraseña
  const hashed = await bcrypt.hash(newPassword, 10);
  // Cambia la contra del usuario en la base dedatos
  await updatePassword(payload.id, hashed);

  return res.status(200).json({ success: true, message: 'Contraseña actualizada' });

}catch(error){
  console.error('Error restore:', error);
  return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
}
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No hay refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await findUser(payload.id);
    if (!user) {
      return res.status(403).json({ success: false, message: 'Usuario no encontrado' });
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.nombre,
        role: user.rol,
        pais: user.pais,
        fontSize: user.font,
        contrast: user.contrast
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({ success: true, token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Refresh token inválido o expirado' });
  }
};

const logout = async (req, res) => {
  const userId = req.user.id; // viene del middleware verifyT
  await deleteRefreshToken(userId);
  return res.json({ success: true, message: 'Sesión cerrada' });
};

module.exports = {
  login, newUser, recoveryUser, editUser, restore, logout, refresh
};