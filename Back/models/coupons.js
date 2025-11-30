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

module.exports = { 
  getCoupon, 
  usarCupon,
  createCoupon,      // NUEVO
  disableCoupon,     // NUEVO
  getAllCoupons      // NUEVO
};
