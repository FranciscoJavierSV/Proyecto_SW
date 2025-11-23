const mysql = require('mysql2/promise');

// conexión al pool
const pool = mysql.createPool({
  host: 'localhost', // hubicacion de la base
  user: 'root', // usuario de la base de datos
  password: '', // contrasena de la base 
  database: 'tienda' // tabla a la que va a modificar
});

// buscar usuario por correo
async function findUser(correo) {
  const [rows] = await pool.query('SELECT * FROM users WHERE correo = ?', [correo]);
  return rows[0]; // devuelve el primer usuario encontrado
}

// verificar si existe correo
async function findEmail(correo) {
  const [rows] = await pool.query('SELECT id, correo FROM users WHERE correo = ?', [correo]);
  return rows[0];
}

// crear usuario nuevo
async function createUser(user) {
  const { username, contrasena, correo, pais } = user; 
  const [result] = await pool.query(
    'INSERT INTO users (nombre, contrasena, correo, pais) VALUES (?, ?, ?, ?)',
    [username, contrasena, correo, pais]
  );
  return result.affectedRows > 0;
}

// actualizar contraseña
async function updatePassword(userId, newContrasena) {
  const [result] = await pool.query(
    'UPDATE users SET contrasena = ? WHERE id = ?',
    [newContrasena, userId]
  );
  return result.affectedRows > 0;
}

// guardar refresh token
async function saveRefreshToken(userId, token) {
  const [result] = await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
    [userId, token]
  );
  return result.affectedRows > 0;
}

// Funciones para actualizar preferencias de accesibilidad del usuario
async function updateUserCountry(userId, pais) {
  const [result] = await pool.query(
    'UPDATE users SET pais = ? WHERE id = ?',
    [pais, userId]
  );
  return result.affectedRows > 0;
}

async function updateUserFontSize(userId, fontSize) {
  const [result] = await pool.query(
    'UPDATE users SET font = ? WHERE id = ?',
    [fontSize, userId]
  );
  return result.affectedRows > 0;
}

async function updateUserContrast(userId, contrast) {
  const [result] = await pool.query(
    'UPDATE users SET contrast = ? WHERE id = ?',
    [contrast, userId]
  );
  return result.affectedRows > 0;
}

async function deleteRefreshToken(userId) {
  const [result] = await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  return result.affectedRows > 0;
}

module.exports = {
  findUser,
  findEmail,
  createUser,
  updatePassword,
  saveRefreshToken,
  updateUserCountry,
  updateUserFontSize,
  updateUserContrast,
  deleteRefreshToken
};