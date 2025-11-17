// info en README.md
const express = require('express');
const router = express.Router();
const {verifyT} = require('../middleware/authMiddleware');
const carrito = require('../controllers/cart');
const venta = require('../controllers/sales');
const deseos = require('../controllers/wishlist');

//    router.post('/logout',verifyT); parece inecesaria

//     router.get('/perfil',verifyT); en caso de requerir los datos del usuario en pantalla 
    router.post('/accessibility',verifyT);

    // Acceder al carrito 
    router.get('/cart',verifyT);
    router.post('/cart',verifyT);
    router.patch('/cart/:prodId',verifyT);
    router.delete('/cart/:prodId',verifyT);
    router.post('/cart/coupon',verifyT);

    // registrar y acomodar la compra
    router.post('/ordenar',verifyT);
    router.get('/ordenar',verifyT);
    router.get('/ordenar/:id/pdf',verifyT);
    router.post('/ordenar/:id/email',verifyT);
    
    // Administrar y actualizar la wishlist del usuario
    router.get('/wishlist',verifyT);
    router.post('/wishlist',verifyT);

module.exports = router;