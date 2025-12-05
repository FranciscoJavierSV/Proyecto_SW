const jwt = require('jsonwebtoken');              // Manejo y verificación de tokens JWT
const svgCaptcha = require("svg-captcha");        // Generación de captchas en SVG
const { captchas } = require("../utils/captchaStore"); // Almacén temporal de captchas generados
const JWT_SECRET = process.env.JWT_SECRET;        // Clave secreta para validar tokens

// ----------------------------------------------------
// VERIFICAR TOKEN (ACCESS TOKEN)
// Middleware que valida que el usuario envíe un JWT válido
// ----------------------------------------------------
const verifyT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // Obtiene el header Authorization

    // Si no se envía el header Authorization
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token. Debe enviar: Authorization: Bearer <token>'
      });
    }

    // Extrae el token después de "Bearer"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato inválido. Use: Authorization: Bearer <token>'
      });
    }

    // Verifica el token con la clave secreta
    const decoded = jwt.verify(token, JWT_SECRET);

    // Guarda la información del usuario en la request
    req.user = decoded;

    next(); // Continúa al siguiente middleware o controlador

  } catch (error) {
    // Token expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        expired: true,
        message: 'Token expirado. Solicite uno nuevo con refresh token.'
      });
    }

    // Token alterado o inválido
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o modificado.'
      });
    }

    // Error inesperado
    return res.status(500).json({
      success: false,
      message: 'Error al verificar el token.'
    });
  }
};

// ----------------------------------------------------
// VALIDAR SI EL USUARIO ES ADMIN
// Middleware que permite acceso solo a usuarios con rol "admin"
// ----------------------------------------------------
const isAdmin = (req, res, next) => {
  if (req.user?.rol === 'admin') {
    return next(); // Usuario autorizado
  }

  return res.status(403).json({
    success: false,
    message: 'Acceso denegado. No eres administrador.'
  });
};

// ----------------------------------------------------
// VALIDAR CAPTCHA
// Middleware que valida que el captcha enviado coincida con el generado
// ----------------------------------------------------
const captchaV = (req, res, next) => {
  try {
    const { tokenCaptcha, captchaIngresado } = req.body; // Datos enviados por el usuario

    // Validación de campos requeridos
    if (!tokenCaptcha || !captchaIngresado) {
      return res.status(400).json({ succes: false, message: "Faltan datos del captcha" });
    }

    // Busca el captcha en el almacén temporal
    const registro = captchas[tokenCaptcha];

    // Si no existe, ya expiró o nunca fue generado
    if (!registro) {
      return res.status(400).json({ succes: false, message: "Captcha inválido o expirado" });
    }

    // Verifica si el captcha ya expiró
    if (Date.now() > registro.expira) {
      delete captchas[tokenCaptcha]; // Limpieza
      return res.status(400).json({ succes: false, message: "Captcha expirado" });
    }

    // Compara el texto ingresado con el generado
    if (registro.texto.toLowerCase() !== captchaIngresado.toLowerCase()) {
      return res.status(400).json({ succes: false, message: "Captcha incorrecto" });
    }

    // Captcha válido → eliminar para evitar reutilización
    delete captchas[tokenCaptcha];

    next(); // Continúa al siguiente middleware o controlador

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al validar captcha.'
    });
  }
};

// Exporta los middlewares para usarlos en las rutas
module.exports = {
  verifyT,
  isAdmin,
  captchaV
};