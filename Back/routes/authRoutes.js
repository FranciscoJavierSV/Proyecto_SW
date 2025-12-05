const express = require('express');
const router = express.Router();

// Middlewares y controladores
const { verifyT } = require('../middleware/authMiddleware');
const users = require('../controllers/users');
const cartController = require('../controllers/cart');
const salesController = require('../controllers/sales');
const wishlistController = require('../controllers/wishlist');

// ---- USUARIO ----
router.post('/logout', verifyT, users.logout);               // Cerrar sesión
router.post('/refresh', users.refresh);                      // Renovar token
router.post('/accessibility', verifyT, users.editUser);      // Editar usuario
router.post("/recovery", users.recoveryUser);                // Enviar token de recuperación
router.post("/validate-token", users.validateToken);         // Validar token recibido
router.post("/change-password", users.changePassword);       // Cambiar contraseña

// ---- LOGIN Y REGISTER ----
router.post('/login', users.login);                          // Iniciar sesión
router.post('/register', users.newUser);                     // Registrar usuario

// ---- CARRITO ----
router.get('/cart', verifyT, cartController.getCart);        // Obtener carrito
router.post('/cart', verifyT, cartController.addToCart);     // Agregar producto
router.patch('/cart/:productId', verifyT, cartController.updateCartItem); // Actualizar cantidad
router.delete('/cart/:id', verifyT, cartController.deleteCartItem);       // Eliminar producto
router.post('/cart/coupon', verifyT, cartController.applyCoupon);         // Aplicar cupón
router.delete("/cart", verifyT, cartController.clearCart);   // Vaciar carrito

// ---- WISHLIST ----
router.get('/wishlist', verifyT, wishlistController.getWishlist);         // Obtener wishlist
router.post('/wishlist', verifyT, wishlistController.addToWishlist);      // Agregar a wishlist
router.delete('/wishlist/:productId', verifyT, wishlistController.removeFromWishlist); // Eliminar

// ---- COMPRAS ----
router.post('/ordenar', verifyT, salesController.createOrder);            // Crear orden
router.get('/ordenar', verifyT, salesController.getOrders);               // Obtener órdenes
router.post('/ordenar/pdf', verifyT, salesController.getOrderPDF);        // Generar PDF

module.exports = router;