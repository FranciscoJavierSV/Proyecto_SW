const pool = require('../db/conexion');

async function getCoupon(code) {
  const [[cupon]] = await pool.query(
    "SELECT * FROM cupones WHERE codigo = ? AND activo = 1",
    [code]
  );
  return cupon;
}

async function usarCupon(code) {
  const [result] = await pool.query(
    "UPDATE cupones SET usado = usado + 1 WHERE codigo = ?",
    [code]
  );
  return result.affectedRows > 0;
}

async function createCoupon(coupon) {
  const [result] = await pool.query(
    `INSERT INTO cupones (codigo, tipo, valor, expiracion, uso_maximo, activo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [coupon.codigo, coupon.tipo, coupon.valor, coupon.expiracion, coupon.uso_maximo, coupon.activo]
  );
  return result.affectedRows > 0;
}

async function disableCoupon(code) {
  const [result] = await pool.query(
    "UPDATE cupones SET activo = 0 WHERE codigo = ?",
    [code]
  );
  return result.affectedRows > 0;
}

async function getAllCoupons() {
  const [rows] = await pool.query("SELECT * FROM cupones");
  return rows;
}

async function validateCoupon(code) {
  const [[cupon]] = await pool.query(
    "SELECT * FROM cupones WHERE codigo = ? AND activo = 1",
    [code]
  );

  if (!cupon) {
    return { valid: false, message: "Cupón no existe o está inactivo" };
  }

  // Validar fecha
  const hoy = new Date();
  const exp = new Date(cupon.expiracion);

  if (hoy > exp) {
    return { valid: false, message: "El cupón ha expirado" };
  }

  // Validar uso máximo, si aplica
  if (cupon.uso_maximo !== null && cupon.usado >= cupon.uso_maximo) {
    return { valid: false, message: "El cupón ya alcanzó su límite de usos" };
  }

  // Si todo está bien → cupón válido
  return { valid: true, coupon: cupon };
}


module.exports = { 
  getCoupon, 
  usarCupon,
  createCoupon,      // NUEVO
  disableCoupon,     // NUEVO
  getAllCoupons,      // NUEVO
  validateCoupon
};
