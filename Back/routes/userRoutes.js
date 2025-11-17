// info en README.md
const express = require('express');
const router = express.Router();
const usuarios = require('../controllers/users');
const validar = require('../middleware/authMiddleware')
const productos = require('../controllers/items');

// usuario
    router.post('/register', usuarios.newUser); //-----hecho user
    router.post('/login', usuarios.login);    // -----hecho  user
    
// recuperacion
    router.get('/captcha', validar.captcha);  // creado
    router.post('/captcha', validar.captchaV); // creado

    router.post('/recover', usuarios.recoveryUser); // -----hecho user
    router.post('/reset', usuarios.restore);  //  ----- hecho user

// productos a la vista
    router.get('/products', );
    router.get('/products/:cat', );
    router.get('/products/:id', );

// Contacto
    router.post('/contact', );
    router.post('/suscripcion',);

module.exports = router;