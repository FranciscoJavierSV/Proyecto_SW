// Carga variables del archivo .env
require('dotenv').config();

// Importa dependencias principales
const express = require('express');
const cors = require('cors');

// Inicializa la aplicación
const app = express();

// Middleware para procesar JSON y habilitar CORS
app.use(express.json()); 
app.use(cors());

// Importa las rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const privRoutes = require('./routes/privRoutes');

// Usa las rutas bajo el prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/public', userRoutes);
app.use('/api/account', privRoutes);

// Ruta por defecto si no se encuentra la solicitada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Configura el puerto desde .env y levanta el servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Exporta la app para pruebas u otros usos
module.exports = app;