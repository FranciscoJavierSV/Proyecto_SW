// info en README.md
const express = require('express');
const router = express.Router();
const {verifyT} = require('../middleware/authMiddleware');
const carrito = require('../controllers/cart');
const venta = require('../controllers/sales');
const deseos = require('../controllers/wishlist');
const { logout, editUser } = require('../controllers/users');

router.post('/logout',verifyT,logout); // = terminado
router.post('/accessibility', verifyT, editUser); // = terminado

//router.get('/perfil',verifyT); en caso de requerir los datos del usuario en pantalla 


// Acceder al carrito 
//router.get('/cart', verifyT, carrito.getCart);
//router.post('/cart', verifyT, carrito.addToCart);
//router.patch('/cart/:prodId', verifyT, carrito.updateCartItem);
//router.delete('/cart/:prodId', verifyT, carrito.deleteCartItem);
//router.post('/cart/coupon', verifyT, carrito.applyCoupon);

// registrar y acomodar la compra
//router.post('/ordenar', verifyT, venta.createOrder);
//router.get('/ordenar', verifyT, venta.getOrders);
//router.get('/ordenar/:id/pdf', verifyT, venta.getOrderPDF);
//router.post('/ordenar/:id/email', verifyT, venta.sendOrderEmail);

// Administrar y actualizar la wishlist del usuario
//router.get('/wishlist', verifyT, deseos.getWishlist);
//router.post('/wishlist', verifyT, deseos.addToWishlist);

module.exports = router;