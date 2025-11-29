const pool = require('../db/conexion');

// ====================================
// Obtener wishlist por usuario
// ====================================
async function getWishlist(userId) {
  const [rows] = await pool.query(
    `
    SELECT w.id, w.producto_id, p.nombre, p.precio, p.imagen
    FROM wishlist w
    INNER JOIN productos p ON w.producto_id = p.id
    WHERE w.usuario_id = ?
    `,
    [userId]
  );
  return rows;
}

// ====================================
// Agregar producto a wishlist
// ====================================
async function addItem(userId, productId) {
  // evitar duplicados
  const [exists] = await pool.query(
    `SELECT * FROM wishlist WHERE usuario_id = ? AND producto_id = ?`,
    [userId, productId]
  );

  if (exists.length > 0) {
    return { already: true };
  }

  const [result] = await pool.query(
    `INSERT INTO wishlist (usuario_id, producto_id) VALUES (?, ?)`,
    [userId, productId]
  );

  return { insertId: result.insertId };
}

// ====================================
// Eliminar un producto de wishlist
// ====================================
async function removeItem(userId, productId) {
  const [result] = await pool.query(
    `
    DELETE FROM wishlist 
    WHERE usuario_id = ? AND producto_id = ?
    `,
    [userId, productId]
  );

  return { affectedRows: result.affectedRows };
}

module.exports = {
  getWishlist,
  addItem,
  removeItem
};
