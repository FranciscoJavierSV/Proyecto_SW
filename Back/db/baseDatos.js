const mysql = require('mysql2/promise');

// conexión al pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tienda'
});

// exportar el pool para usarlo desde los modelos
module.exports = pool;


/// Esta base solo es la conexion solo para probar 