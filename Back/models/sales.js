// models/sales.js
const pool = require('../db/conexion');
const { useCoupon } = require('./coupons');

// =====================================
// Crear una venta
// =====================================
async function createSale(userId, subtotal, descuento, codigoCupon, iva, total) {

  // 1. Insertar venta en tabla sales
  const [sale] = await pool.query(
    `
      INSERT INTO sales 
      (usuario_id, fecha, subtotal, descuento, codigo_cupon, iva, total, productos)
      VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
    `,
    [userId, subtotal, descuento, codigoCupon, iva, total, 0] // productos se actualiza después
  );

  return sale.insertId;
}

// =====================================
// Registrar item en sales_items
// =====================================
async function addSaleItem(saleId, productoId, cantidad, precioUnitario, subtotal) {
  const [insert] = await pool.query(
    `
      INSERT INTO sales_items 
      (sale_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `,
    [saleId, productoId, cantidad, precioUnitario, subtotal]
  );

  return insert.insertId;
}

// =====================================
// Actualizar número de productos vendidos
// =====================================
async function updateSaleProductCount(saleId, count) {
  await pool.query(
    `UPDATE sales SET productos = ? WHERE id = ?`,
    [count, saleId]
  );
}

// =====================================
// Obtener ventas del usuario
// =====================================
async function getUserSales(userId) {
  const [rows] = await pool.query(
    `
      SELECT id, fecha, subtotal, iva, descuento, total, productos, codigo_cupon
      FROM sales
      WHERE usuario_id = ?
      ORDER BY fecha DESC
    `,
    [userId]
  );
  return rows;
}

// =====================================
// Obtener items de una venta
// =====================================
async function getSaleItems(saleId) {
  const [rows] = await pool.query(
    `
      SELECT si.*, p.nombre, p.imagen
      FROM sales_items si
      INNER JOIN productos p ON si.producto_id = p.id
      WHERE sale_id = ?
    `,
    [saleId]
  );
  return rows;
}

// =====================================
// Obtener una venta completa (para PDF)
// =====================================
async function getSaleById(saleId) {
  const [sale] = await pool.query(
    `SELECT * FROM sales WHERE id = ?`,
    [saleId]
  );
  return sale[0] || null;
}

// =====================================
// Obtener datos para gráfica de ventas (agrupadas por fecha)
// =====================================
async function getSalesChart() {
  const [rows] = await pool.query(
    `
      SELECT DATE(fecha) AS dia, SUM(total) AS totalDia
      FROM sales
      GROUP BY DATE(fecha)
      ORDER BY dia ASC
    `
  );
  return rows; // Ejemplo: [{ dia: '2025-12-01', totalDia: 1500 }, ...]
}

// =====================================
// Obtener el total acumulado de todas las ventas
// =====================================
async function getTotalSales() {
  const [rows] = await pool.query(
    `SELECT SUM(total) AS totalVentas FROM sales`
  );
  return rows[0].totalVentas || 0;
}


module.exports = {
  createSale,
  addSaleItem,
  updateSaleProductCount,
  getUserSales,
  getSaleItems,
  getSaleById,
  getSalesChart,   // <- nuevo
  getTotalSales    // <- nuevo

};
