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

module.exports = { getCoupon, usarCupon };
