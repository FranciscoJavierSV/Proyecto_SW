// info en README.md
const express = require('express');
const router = express.Router();
const usuarios = require('../controllers/users');
const validar = require('../middleware/authMiddleware')
const productos = require('../controllers/items');
const contacto = require('../controllers/contac');

// usuario
router.post('/register', usuarios.newUser); //-----hecho user
router.post('/login', usuarios.login);    // -----hecho  user

// recuperacion
router.get('/captcha', validar.captcha);  // creado
router.post('/captcha', validar.captchaV); // creado

router.post('/recover', usuarios.recoveryUser); // -----hecho user
router.post('/reset', usuarios.restore);  //  ----- hecho user

// productos a la vista
router.get('/products', productos.getAllProducts);
router.get('/products/:cat', productos.getProductsByCategory);
router.get('/products/:id', productos.getProductById);

// Contacto
router.post('/contact', contacto.sendContact);
router.post('/suscripcion', contacto.subscribe);

module.exports = router;