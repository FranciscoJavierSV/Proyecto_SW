// info en README.md
const express = require('express');
const router = express.Router();
const usuarios = require('../controllers/users');
const validar = require('../middleware/authMiddleware')
const productos = require('../controllers/items');
const contacto = require('../controllers/contac');

// usuario
router.post('/register', usuarios.newUser); // = terminado
router.post('/login', usuarios.login);      // = terminado

// recuperacion
// falta terminar valicar capcha esa se maneja con lo la api que se crea en el front
router.post('/recover',validar.captchaV, usuarios.recoveryUser); // = falta una cosa 
router.post('/reset', usuarios.restore);  // = terminado



// productos a la vista
router.get('/products', productos.getAllProducts);
router.get('/products/:cat', productos.getProductsByCategory);
router.get('/products/:id', productos.getProductById);

// Contacto
router.post('/contact', contacto.sendContact);
router.post('/suscripcion', contacto.subscribe);

module.exports = router;