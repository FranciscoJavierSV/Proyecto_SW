// importar pool desde el archivo central de la BD
const pool = require('../db/baseDatos');

// busca usuario por correo
async function findUser(correo) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
  return rows[0] || null;
}

// verifica si existe correo
async function findEmail(correo) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
  return rows[0] || null;
}

// crea usuario nuevo en BD
async function createUser(user) {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, contrasena, correo, pais, font, contrast) VALUES (?, ?, ?, ?, ?, ?)',
    [user.username, user.contrasena, user.correo, user.pais, user.text, user.contrast]
  );
  return result.insertId;
}

// actualiza contraseña del usuario
async function updatePassword(userId, newContrasena) {
  await pool.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [newContrasena, userId]);
  return true;
}

// incrementa intentos fallidos
async function incrementFailedAttempt(userId) {
  await pool.query('UPDATE usuarios SET intentos = intentos + 1 WHERE id = ?', [userId]);
  const [rows] = await pool.query('SELECT intentos FROM usuarios WHERE id = ?', [userId]);
  return rows[0] ? rows[0].intentos : 0;
}

// resetea intentos y quita bloqueo
async function resetFailedAttempts(userId) {
  await pool.query('UPDATE usuarios SET intentos = 0, `block` = NULL WHERE id = ?', [userId]);
  return true;
}

// bloquea usuario hasta fecha especificada
async function lockUserUntil(userId, date) {
  await pool.query('UPDATE usuarios SET `block` = ? WHERE id = ?', [date, userId]);
  return true;
}

// actualiza país del usuario
async function updateUserCountry(userId, pais) {
  await pool.query('UPDATE usuarios SET pais = ? WHERE id = ?', [pais, userId]);
  return true;
}

// actualiza tamaño de fuente del usuario
async function updateUserFontSize(userId, fontSize) {
  await pool.query('UPDATE usuarios SET font = ? WHERE id = ?', [fontSize, userId]);
  return true;
}

// actualiza contraste del usuario
async function updateUserContrast(userId, contrast) {
  await pool.query('UPDATE usuarios SET contrast = ? WHERE id = ?', [contrast, userId]);
  return true;
}

// obtener usuario por id
async function getUserById(userId) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [userId]);
  return rows[0] || null;
}

module.exports = {
  findUser,
  findEmail,
  createUser,
  updatePassword,
  incrementFailedAttempt,
  resetFailedAttempts,
  lockUserUntil,
  updateUserCountry,
  updateUserFontSize,
  updateUserContrast,
  getUserById
};