// info en README.md
const express = require('express');
const router = express.Router();
const {verifyT, isAdmin} = require('../middleware/authMiddleware');
const productos = require('../controllers/items');
const ventas = require('../controllers/sales');

// Todas las rutas protegidas verificando que sea admin
router.post('/mProducts', verifyT, isAdmin, productos.createProduct);
router.put('/mProducts/:id', verifyT, isAdmin, productos.updateProduct);
router.delete('/mProducts/:id', verifyT, isAdmin, productos.deleteProduct);
router.get('/mProducts/inventory', verifyT, isAdmin, productos.getInventory);

router.get('/sales/chart', verifyT, isAdmin, ventas.getSalesChart);
router.get('/sales/total', verifyT, isAdmin, ventas.getTotalSales);

router.get('/inventory', verifyT, isAdmin, productos.getInventoryByCategory);

module.exports = router; 