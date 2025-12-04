const pool = require('../db/conexion'); // usa tu conexión existente

// -----------------------------
// Obtener carrito de un usuario
// -----------------------------
async function getCart(userId) {
  const [rows] = await pool.query(
    `SELECT 
        c.id,
        c.producto_id,
        p.nombre,
        p.precio,
        p.ofertaP,
        p.inventario,
        c.cantidad,
        c.subtotal,
        c.iva,
        c.total,
        c.codigo_cupon,
        c.descuento,
        p.imagen
     FROM cart c
     JOIN productos p ON c.producto_id = p.id
     WHERE c.usuario_id = ?`,
    [userId]
  );

  return rows;
}

// -----------------------------
// Agregar producto al carrito
// -----------------------------
async function addCart(userId, productId, quantity) {
  // Obtener datos del producto
  const [[producto]] = await pool.query(
    "SELECT precio, ofertaP, inventario FROM productos WHERE id = ?",
    [productId]
  );

  if (!producto) return null;
  if (producto.inventario < quantity) return { error: "Inventario insuficiente" };

  // Si tiene oferta, usarla como precio
  const precioActual = producto.ofertaP ?? producto.precio;

  const subtotal = precioActual * quantity;

  // Obtener IVA del país del usuario
  const [[usuario]] = await pool.query(
    `SELECT p.iva 
     FROM usuarios u 
     JOIN paises p ON u.pais_id = p.id
     WHERE u.id = ?`,
    [userId]
  );

  // usuario.iva es porcentaje (ej. 15) -> dividir por 100
  const ivaRate = usuario.iva ? (usuario.iva / 100) : 0;
  const iva = subtotal * ivaRate;
  const total = subtotal + iva;

  const [insert] = await pool.query(
    `INSERT INTO cart (usuario_id, producto_id, cantidad, subtotal, iva, total, descuento, imagen)
     SELECT ?, ?, ?, ?, ?, ?, 0, imagen
     FROM productos WHERE id = ?`,
    [userId, productId, quantity, subtotal, iva, total, productId]
  );

  return insert.affectedRows > 0;
}

async function getCartItem(userId, productId) {
  const [rows] = await pool.query(
    `SELECT 
        c.*, 
        p.inventario,
        p.precio,
        p.ofertaP
     FROM cart c
     JOIN productos p ON c.producto_id = p.id
     WHERE c.usuario_id = ? AND c.producto_id = ?`,
    [userId, productId]
  );
  return rows[0];
}


// -----------------------------
// Actualizar cantidad
// -----------------------------
async function updateCart(userId, productId, quantity) {
  const [[producto]] = await pool.query(
    "SELECT precio, ofertaP, inventario FROM productos WHERE id = ?",
    [productId]
  );

  if (!producto) return null;
  if (producto.inventario < quantity) return { error: "Inventario insuficiente" };

  const precioActual = producto.ofertaP ?? producto.precio;

  const subtotal = precioActual * quantity;

  const [[usuario]] = await pool.query(
    `SELECT p.iva 
     FROM usuarios u 
     JOIN paises p ON u.pais_id = p.id
     WHERE u.id = ?`,
    [userId]
  );

  const ivaRate = usuario.iva ? (usuario.iva / 100) : 0;
  const iva = subtotal * ivaRate;
  const total = subtotal + iva;

  const [update] = await pool.query(
    `UPDATE cart 
     SET cantidad = ?, subtotal = ?, iva = ?, total = ?
     WHERE usuario_id = ? AND producto_id = ?`,
    [quantity, subtotal, iva, total, userId, productId]
  );

  return update.affectedRows > 0;
}

// -----------------------------
// Eliminar producto
// -----------------------------
async function deleteItem(cartId, userId) {
  const [result] = await pool.query(
    "DELETE FROM cart WHERE id = ? AND usuario_id = ?",
    [cartId, userId]
  );
  return result;
}

// -----------------------------
// Aplicar cupón al carrito
// -----------------------------
async function aplicarCupon(userId, codigo) {
  // Obtener cupón
  const [[cupon]] = await pool.query(
    "SELECT * FROM cupones WHERE codigo = ? AND activo = 1",
    [codigo]
  );
  if (!cupon) return { error: "Cupón inválido" };

  // Validación de expiración
  const hoy = new Date();
  if (new Date(cupon.expiracion) < hoy)
    return { error: "Cupón expirado" };

  // Validación de límites de uso
  if (cupon.usado >= cupon.uso_maximo)
    return { error: "Cupón ya no está disponible" };

  // Obtener carrito del usuario
  const cart = await getCart(userId);

  if (cart.length === 0) return { error: "Carrito vacío" };

  // Aplicar descuento según tipo
  for (let item of cart) {
    let descuento = 0;

    if (cupon.tipo === "porcentaje") {
      descuento = item.subtotal * (cupon.valor / 100);
    } else if (cupon.tipo === "fijo") {
      descuento = cupon.valor;
    }

    const nuevoTotal = item.total - descuento;

    await pool.query(
      `UPDATE cart SET codigo_cupon = ?, descuento = ?, total = ?
       WHERE id = ?`,
      [codigo, descuento, nuevoTotal, item.id]
    );
  }

  return { success: true };
}

// Limpiar carrito
async function clearCart(userId) {
  const [result] = await pool.query(
    "DELETE FROM cart WHERE usuario_id = ?",
    [userId]
  );
  return result;
}

module.exports = {
  getCart,
  addCart,
  getCartItem,
  updateCart,
  deleteItem,
  aplicarCupon,
  clearCart
};
