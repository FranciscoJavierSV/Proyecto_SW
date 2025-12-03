const pool = require('../db/conexion');

// ----------------------------------------
// Obtener todos los productos
// ----------------------------------------
async function getProducts() {
  const [rows] = await pool.query(
    `SELECT id, nombre, precio, ofertaP, categoria, inventario, imagen, descripcion 
     FROM productos`
  );
  return rows;
}

// ----------------------------------------
// Obtener productos por categoría
// ----------------------------------------
async function getProductCategory(categoria) {
  const [rows] = await pool.query(
    `SELECT id, nombre, precio, ofertaP, categoria, inventario, imagen, descripcion
     FROM productos
     WHERE categoria = ?`,
    [categoria]
  );
  return rows;
}

// ----------------------------------------
// Obtener producto por ID
// ----------------------------------------
async function getProductId(id) {
  const [[row]] = await pool.query(
    `SELECT id, nombre, precio, ofertaP, categoria, inventario, imagen, descripcion
     FROM productos
     WHERE id = ?`,
    [id]
  );
  return row;
}

// ----------------------------------------
// Agregar producto (admin)
// ----------------------------------------
async function addProduct(product) {
  const { nombre, precio, ofertaP, categoria, inventario, imagen, descripcion } = product;

  const [result] = await pool.query(
    `INSERT INTO productos 
      (nombre, precio, ofertaP, categoria, inventario, imagen, descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, precio, ofertaP, categoria, inventario, imagen, descripcion]
  );

  return result.insertId;
}

// ----------------------------------------
// Actualizar producto (admin)
// ----------------------------------------
async function updateProduct(id, product) {
  const { nombre, precio, ofertaP, categoria, inventario, imagen, descripcion } = product;

  const [result] = await pool.query(
    `UPDATE productos
     SET nombre = ?, precio = ?, ofertaP = ?, categoria = ?, inventario = ?, imagen = ?, descripcion = ?
     WHERE id = ?`,
    [nombre, precio, ofertaP, categoria, inventario, imagen, descripcion, id]
  );

  return result.affectedRows > 0;
}

// ----------------------------------------
// Eliminar producto (admin)
// ----------------------------------------
async function deleteProduct(id) {
  const [result] = await pool.query(
    `DELETE FROM productos WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
}

async function getOftertas() {
  const [rows] = await pool.query(
    `SELECT id, nombre, precio, ofertaP, categoria, inventario, imagen, descripcion
    FROM productos
    WHERE ofertaP IS NOT NULL
      AND ofertaP <> ''`
  );
  return rows;
}

async function getProductsByPriceRange(min, max) {
  const [rows] = await pool.query(
    `SELECT id, nombre, precio, ofertaP, categoria, inventario, imagen, descripcion
     FROM productos
     WHERE precio BETWEEN ? AND ?`,
    [min, max]
  );
  return rows;
}

// ----------------------------------------
// Disminuir inventario (seguro)
// ----------------------------------------
async function decreaseInventory(productId, amount) {
  const [result] = await pool.query(
    "UPDATE productos SET inventario = GREATEST(inventario - ?, 0) WHERE id = ?",
    [amount, productId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getProducts,
  getProductCategory,
  getProductId,
  addProduct,
  updateProduct,
  deleteProduct,
  decreaseInventory, // <- agregado
  getOftertas,
  getProductsByPriceRange
};
