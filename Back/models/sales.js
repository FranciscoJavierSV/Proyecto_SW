const pool = require('../db/baseDatos');
const countries = require('../data/countries.json');

// obtener IVA por país desde countries.json
function getIVAByCountry(country) {
  try {
    // buscar país en countries.json
    for (const key in countries) {
      if (countries[key].name === country) {
        return countries[key].tax || 0.19;
      }
    }
    // si no encuentra, retorna default 19%
    return 0.19;
  } catch (error) {
    console.error('Error al obtener IVA:', error);
    return 0.19;
  }
}

// validar y obtener descuento del cupón
async function validateCoupon(couponCode) {
  try {
    if (!couponCode) return null;
    
    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE codigo = ? AND activo = 1 AND fecha_expiracion > NOW()',
      [couponCode]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error al validar cupón:', error);
    return null;
  }
}

// crear nueva orden (venta) con todos los cálculos
async function createOrder(userId, cartItems, userCountry, couponCode = null) {
  try {
    // calcular subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.price * item.quantity;
    }

    // validar cupón y obtener descuento
    let descuento = 0;
    let couponUsed = null;
    if (couponCode) {
      const coupon = await validateCoupon(couponCode);
      if (coupon) {
        descuento = coupon.porcentaje 
          ? (subtotal * coupon.porcentaje) / 100 
          : coupon.descuento_fijo;
        couponUsed = coupon.codigo;
      }
    }

    // obtener IVA según país del usuario
    const ivaRate = getIVAByCountry(userCountry);
    const subtotalConDescuento = subtotal - descuento;
    const iva = subtotalConDescuento * ivaRate;
    const total = subtotalConDescuento + iva;

    // insertar orden en tabla ordenes
    const [result] = await pool.query(
      'INSERT INTO ordenes (usuario_id, subtotal, descuento, cupon, iva, total, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, subtotal, descuento, couponUsed, iva, total, 'pendiente']
    );
    
    const orderId = result.insertId;
    
    // insertar detalles de la orden (items)
    for (const item of cartItems) {
      await pool.query(
        'INSERT INTO orden_detalles (orden_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
    }
    
    return { orderId, subtotal, descuento, iva, total, couponUsed };
  } catch (error) {
    console.error('Error al crear orden:', error);
    throw error;
  }
}

// obtener órdenes del usuario
async function getOrdersByUser(userId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ordenes WHERE usuario_id = ? ORDER BY fecha DESC',
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    throw error;
  }
}

// obtener detalles de una orden específica
async function getOrderDetails(orderId) {
  try {
    const [rows] = await pool.query(
      'SELECT od.*, p.nombre, p.imagen FROM orden_detalles od JOIN productos p ON od.producto_id = p.id WHERE od.orden_id = ?',
      [orderId]
    );
    return rows;
  } catch (error) {
    console.error('Error al obtener detalles de orden:', error);
    throw error;
  }
}

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderDetails,
  validateCoupon,
  getIVAByCountry
};