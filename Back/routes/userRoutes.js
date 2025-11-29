const express = require('express');
const router = express.Router();

const usuarios = require('../controllers/users');
const validar = require('../middleware/authMiddleware');
const productos = require('../controllers/items');
const contacto = require('../controllers/contac');
const { listarPaises } = require('../controllers/paises');

// ---- USUARIO ----
router.post('/register', usuarios.newUser);
router.post('/login', usuarios.login);
router.get('/paises', listarPaises);

// ---- RECUPERACIÓN ----
router.post('/recover', validar.captchaV, usuarios.recoveryUser);
router.post('/reset', usuarios.restore);

// ---- PRODUCTOS PUBLICOS ----
router.get('/products', productos.getAllProducts);
router.get('/products/category/:cat', productos.getProductsByCategory);
router.get('/products/id/:id', productos.getProductById);

// ---- CONTACTO Y SUSCRIPCIÓN ----
router.post('/contact', contacto.sendContact);
router.post('/suscripcion', contacto.subscribe);

module.exports = router;
