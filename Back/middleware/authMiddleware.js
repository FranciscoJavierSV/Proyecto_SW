const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET


// Revisa si el token es valido
const verifyT = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    // Revisa si hay algo en el header
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Debe enviar: Authorization: Bearer <token>'
      });
    }

    // Extraer el token y le quita lo inecesario
    const token = authHeader.split(' ')[1];
    
    // revisa si existe  el token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    // Verificar el token usando la variable secreta el ENV
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // obtiene los datos del usuaio 
    req.user = decoded;
    
    // la revision esta correcta 
    next();
    
// Sino vamos a los errores
  } catch (error) {
    // Si el token es inválido o expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Debe hacer login nuevamente.'
      });
    // Si esta modificado 
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o falsificado.'
      });
    // En caso de que el servidor tenga un problema al revisarlo
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar el token.'
      });
    }
  }
};

// Revisa si la cuenta es admin
const isAdmin = (req, res, next) =>{
   if (req.user?.role === 'admin') {
    return next(); // El usuario tiene rol admin, continúa
  }

  return res.status(403).json({
    success: false,
    message: 'Acceso denegado. No eres Administrador.'
  });
};


// Crea el captcha 
const captcha = (req, res, next) =>{

};

// Valida el cpatcha
const captchaV = (req, res, next) =>{
  
};




module.exports = {
  verifyT,isAdmin,captcha,captchaV
};