// Carga variables del archivo .env
require('dotenv').config();

// Importa dependencias principales
const express = require('express');
const cors = require('cors');

// Inicializa la aplicación
const app = express();

const allowedOrigins = [
    "https://franciscojaviersv.github.io",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

// Middleware para procesar JSON y habilitar CORS
app.use(express.json()); 
app.use(cors({
  origin: [
    "https://franciscojaviersv.github.io",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// Importa las rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const privRoutes = require('./routes/privRoutes');

// Usa las rutas bajo el prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/public', userRoutes);
app.use('/api/account', privRoutes);

// Ruta por defecto si no se encuentra la solicitada
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Ruta no encontrada'
//   });
// });

// Solo para verificar si funciona
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Configura el puerto desde .env y levanta el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Exporta la app para pruebas u otros usos
module.exports = app;