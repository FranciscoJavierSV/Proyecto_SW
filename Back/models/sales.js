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

async function getSalesByCategory() {
  const [rows] = await pool.query(`
    SELECT p.categoria, SUM(si.cantidad) AS cantidad
    FROM sales_items si
    JOIN productos p ON p.id = si.producto_id
    GROUP BY p.categoria
  `);
  return rows;
}

async function getCompanyTotalSales() {
  const [rows] = await pool.query(`
    SELECT SUM(total) AS totalGeneral 
    FROM sales
  `);

  return rows[0].totalGeneral || 0;
}

async function getSalesByProduct() {
  const [rows] = await pool.query(`
    SELECT 
      p.nombre AS producto,
      si.categoria,
      SUM(si.cantidad) AS cantidadVendida,
      SUM(si.subtotal) AS totalGenerado
    FROM sales_items si
    INNER JOIN productos p ON si.producto_id = p.id
    GROUP BY si.producto_id, si.categoria
    ORDER BY si.categoria, producto
  `);

  return rows;
}


module.exports = {
  createSale,
  addSaleItem,
  updateSaleProductCount,
  getUserSales,
  getSaleItems,
  getSaleById,
  getSalesByCategory,
  getSalesByProduct,
  getCompanyTotalSales
};
