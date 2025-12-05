// Rutas públicas del sistema (registro, login, productos, contacto, etc.)
const express = require('express');
const router = express.Router();

// Controladores y middlewares
const usuarios = require('../controllers/users');
const validar = require('../middleware/authMiddleware');
const productos = require('../controllers/items');
const contacto = require('../controllers/contac');
const { listarPaises } = require('../controllers/paises');

// ---- USUARIO ----
router.post('/register', usuarios.newUser);                     // Registrar usuario
router.post('/login', validar.captchaV, usuarios.login);        // Login con verificación captcha
router.get('/paises', listarPaises);                            // Listar países
router.get('/generarCaptcha', usuarios.generarCaptcha);         // Generar captcha

// ---- RECUPERACIÓN ----
router.post('/recover', usuarios.recoveryUser);                 // Enviar correo de recuperación
router.post('/reset', usuarios.restore);                        // Restaurar contraseña

// ---- PRODUCTOS PÚBLICOS ----
router.get('/products', productos.getAllProducts);              // Listar productos
router.get('/products/category/:cat', productos.getProductsByCategory); // Filtrar por categoría
router.get('/products/id/:id', productos.getProductById);       // Obtener producto por ID
router.get('/filtros', productos.getProductsbyFilters);         // Filtros avanzados

// ---- CONTACTO Y SUSCRIPCIÓN ----
router.post('/contact', contacto.sendContact);                  // Enviar mensaje de contacto
router.post('/suscripcion', contacto.subscribe);                // Suscripción a newsletter

module.exports = router;