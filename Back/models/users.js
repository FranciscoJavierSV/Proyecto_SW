const pool = require('../db/conexion');

// ----------------------------------------------------
// BUSCAR USUARIO COMPLETO PARA LOGIN
// ----------------------------------------------------
async function findUser(correo) {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE correo = ?',
    [correo]
  );
  return rows[0];
}

// ----------------------------------------------------
// BUSCAR SOLO PARA VALIDAR SI EXISTE CORREO
// ----------------------------------------------------
async function findEmail(correo) {
  const [rows] = await pool.query(
    'SELECT id, correo FROM usuarios WHERE correo = ?',
    [correo]
  );
  return rows[0];
}

// ----------------------------------------------------
// CREAR USUARIO
// ----------------------------------------------------
async function createUser(user) {
  const { username, contrasena, correo, pais_id, preferencias } = user;

  const [result] = await pool.query(
    `INSERT INTO usuarios 
      (nombre, contrasena, correo, rol, pais_id, preferencias) 
     VALUES (?, ?, ?, 'cliente', ?, ?)`,
    [username, contrasena, correo, pais_id, preferencias]
  );

  return result.affectedRows > 0;
}

// ----------------------------------------------------
// ACTUALIZAR CONTRASEÑA
// ----------------------------------------------------
async function updatePassword(userId, newContrasena) {
  const [result] = await pool.query(
    'UPDATE usuarios SET contrasena = ? WHERE id = ?',
    [newContrasena, userId]
  );

  return result.affectedRows > 0;
}

// ----------------------------------------------------
// ACTUALIZAR INTENTOS
// ----------------------------------------------------
async function updateLoginAttempts(userId, attempts) {
  await pool.query(
    'UPDATE usuarios SET intentos = ? WHERE id = ?',
    [attempts, userId]
  );
}

// ----------------------------------------------------
// BLOQUEAR USUARIO POR 15 MINUTOS
// ----------------------------------------------------
async function blockUser(userId) {
  await pool.query(
    'UPDATE usuarios SET block = DATE_ADD(NOW(), INTERVAL 15 MINUTE), intentos = 0 WHERE id = ?',
    [userId]
  );
}

// ----------------------------------------------------
// RESETEAR BLOQUEO E INTENTOS
// ----------------------------------------------------
async function resetAttempts(userId) {
  await pool.query(
    'UPDATE usuarios SET intentos = 0, block = NULL WHERE id = ?',
    [userId]
  );
}

// ----------------------------------------------------
// ACTUALIZAR PREFERENCIAS DE USUARIO
// ----------------------------------------------------
async function updateUserCountry(userId, countryId) {
  const [result] = await pool.query(
    "UPDATE usuarios SET pais_id = ? WHERE id = ?",
    [countryId, userId]
  );
  return result.affectedRows > 0;
}

// actualiza tamaño de fuente del usuario
async function updateUserFontSize(userId, fontSize) {
  const [result] = await pool.query(
    'UPDATE usuarios SET font = ? WHERE id = ?',
    [fontSize, userId]
  );
  return result.affectedRows > 0;
}

// actualiza contraste del usuario
async function updateUserContrast(userId, contrast) {
  const [result] = await pool.query(
    'UPDATE usuarios SET contrast = ? WHERE id = ?',
    [contrast, userId]
  );
  return result.affectedRows > 0;
}

// Obtener usuario por id
async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

// ----------------------------------------------------
// EXPORTAR
// ----------------------------------------------------
module.exports = {
  findUser,
  findEmail,
  createUser,
  updatePassword,
  updateUserCountry,
  updateUserFontSize,
  updateUserContrast,
  updateLoginAttempts,
  blockUser,
  resetAttempts,
  getUserById
};
