const express = require('express');
const router = express.Router();

const { verifyT } = require('../middleware/authMiddleware');
const users = require('../controllers/users'); 
const cartController = require('../controllers/cart');
const salesController = require('../controllers/sales');
const wishlistController = require('../controllers/wishlist');
const couponController = require('../controllers/cupons');

// ---- USUARIO ----
router.post('/logout', verifyT, users.logout);
router.post('/refresh', users.refresh);
router.post('/accessibility', verifyT, users.editUser);
router.post("/recovery", users.recoveryUser);            // Enviar token
router.post("/validate-token", users.validateToken);      // Validar token
router.post("/change-password", users.changePassword);    // Cambiar contraseña

// ---- LOGING Y REGISTER ----
router.post('/login', users.login); 
router.post('/register', users.newUser);

// ---- CARRITO ----
router.get('/cart', verifyT, cartController.getCart);
router.post('/cart', verifyT, cartController.addToCart);
router.patch('/cart/:productId', verifyT, cartController.updateCartItem);
router.delete('/cart/:id', verifyT, cartController.deleteCartItem);
router.post('/cart/coupon', verifyT, cartController.applyCoupon);
router.delete("/cart", verifyT, cartController.clearCart);

// ---- WISHLIST ----
router.get('/wishlist', verifyT, wishlistController.getWishlist);
router.post('/wishlist', verifyT, wishlistController.addToWishlist);
router.delete('/wishlist/:productId', verifyT, wishlistController.removeFromWishlist);

// ---- COMPRAS ----
router.post('/ordenar', verifyT, salesController.createOrder);
router.get('/ordenar', verifyT, salesController.getOrders);
router.post('/ordenar/pdf', verifyT, salesController.getOrderPDF);

// ---- CUPÓn ----
router.post('/validar-cupon', verifyT, couponController.validateCoupon);


module.exports = router;

