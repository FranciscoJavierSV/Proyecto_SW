const pool = require('../db/conexion');

async function getPaises() {
  const [rows] = await pool.query('SELECT id, nombre FROM paises ORDER BY nombre ASC');
  return rows;
}

module.exports = { getPaises };
