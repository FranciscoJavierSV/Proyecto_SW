const jwt = require('jsonwebtoken');
const svgCaptcha = require("svg-captcha");
const { captchas } = require("../utils/captchaStore");
const JWT_SECRET = process.env.JWT_SECRET;

// ----------------------------------------------------
// VERIFICAR TOKEN (ACCESS TOKEN)
// ----------------------------------------------------
const verifyT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Si no viene header
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token. Debe enviar: Authorization: Bearer <token>'
      });
    }

    // Formato incorrecto
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato inválido. Use: Authorization: Bearer <token>'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Guardar la info del usuario para los controllers
    req.user = decoded;

    next();

  } catch (error) {
    // token expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        expired: true,
        message: 'Token expirado. Solicite uno nuevo con refresh token.'
      });
    }

    // token alterado
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o modificado.'
      });
    }

    // error interno
    return res.status(500).json({
      success: false,
      message: 'Error al verificar el token.'
    });
  }
};

// ----------------------------------------------------
// VALIDAR SI EL USUARIO ES ADMIN
// ----------------------------------------------------
const isAdmin = (req, res, next) => {
  if (req.user?.rol === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Acceso denegado. No eres administrador.'
  });
};

// ----------------------------------------------------
// VALIDAR CAPTCHA
// ----------------------------------------------------
const captchaV = (req, res, next) => {
  try {
    const { tokenCaptcha, captchaIngresado } = req.body;

    if (!tokenCaptcha || !captchaIngresado) {
        return res.status(400).json({ succes: false, message: "Faltan datos del captcha" });
    }

    const registro = captchas[tokenCaptcha];

    if (!registro) {
        return res.status(400).json({ succes: false, message: "Captcha inválido o expirado" });
    }

    if (Date.now() > registro.expira) {
        delete captchas[tokenCaptcha];
        return res.status(400).json({ succes: false, message: "Captcha expirado" });
    }

    if (registro.texto.toLowerCase() !== captchaIngresado.toLowerCase()) {
        return res.status(400).json({ succes: false, message: "Captcha incorrecto" });
    }

    // captcha correcto → eliminar para no reusar
    delete captchas[tokenCaptcha];

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al validar captcha.'
    });
  }
};

 
module.exports = {
  verifyT,
  isAdmin,
  captchaV
};
