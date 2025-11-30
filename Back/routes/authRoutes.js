const express = require('express');
const router = express.Router();

const { verifyT } = require('../middleware/authMiddleware');
const users = require('../controllers/users');  // <- AGREGAR ESTA LÍNEA
const cartController = require('../controllers/cart');
const salesController = require('../controllers/sales');
const wishlistController = require('../controllers/wishlist');

// ---- USUARIO ----
router.post('/logout', verifyT, users.logout);
router.post('/refresh', users.refresh);
router.post('/accessibility', verifyT, users.editUser);

// ---- CARRITO ----
router.get('/cart', verifyT, cartController.getCart);
router.post('/cart', verifyT, cartController.addToCart);
router.patch('/cart/:productId', verifyT, cartController.updateCartItem);
router.delete('/cart/:id', verifyT, cartController.deleteCartItem);
router.post('/cart/coupon', verifyT, cartController.applyCoupon);

// ---- WISHLIST ----
router.get('/wishlist', verifyT, wishlistController.getWishlist);
router.post('/wishlist', verifyT, wishlistController.addToWishlist);
router.delete('/wishlist/:productId', verifyT, wishlistController.removeFromWishlist);

// ---- COMPRAS ----
router.post('/ordenar', verifyT, salesController.createOrder);
router.get('/ordenar', verifyT, salesController.getOrders);
router.get('/ordenar/:id/pdf', verifyT, salesController.getOrderPDF);
router.post('/ordenar/:id/email', verifyT, salesController.sendOrderEmail);

module.exports = router;

