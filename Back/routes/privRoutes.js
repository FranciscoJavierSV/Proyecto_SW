// Rutas administrativas (solo accesibles para administradores)
const express = require('express');
const router = express.Router();

// Middlewares y controladores
const { verifyT, isAdmin } = require('../middleware/authMiddleware');
const productos = require('../controllers/items');
const ventas = require('../controllers/sales');

// ---- PRODUCTOS (ADMIN) ----
router.post('/mProducts', verifyT, isAdmin, productos.createProduct);          // Crear producto
router.put('/mProducts/:id', verifyT, isAdmin, productos.updateProduct);       // Actualizar producto
router.delete('/mProducts/:id', verifyT, isAdmin, productos.deleteProduct);    // Eliminar producto
router.get('/mProducts/inventory', verifyT, isAdmin, productos.getInventory);  // Inventario completo

// ---- REPORTES DE VENTAS ----
router.get('/sales/chart', verifyT, isAdmin, ventas.getSalesChart);            // Datos para gráficas
router.get('/sales/products', verifyT, isAdmin, ventas.getSalesProducts);      // Ventas por producto
router.get('/sales/company-total', verifyT, isAdmin, ventas.getTotalCompanySales); // Total general

// ---- INVENTARIO POR CATEGORÍA ----
router.get('/inventory', verifyT, isAdmin, productos.getInventoryByCategory);  // Inventario filtrado

// ---- PDF DE ÓRDENES ----
router.post('/orders/pdf', verifyT, ventas.getOrderPDF);                       // Generar PDF de orden

module.exports = router;