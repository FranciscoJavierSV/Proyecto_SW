// Carga variables del archivo .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Orígenes permitidos para CORS
const allowedOrigins = [
  "https://franciscojaviersv.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(express.json());

// Configuración de CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Permite Postman u orígenes sin header
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("No permitido por CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const privRoutes = require("./routes/privRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/public", userRoutes);
app.use("/api/account", privRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Levanta el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/`);
});

module.exports = app;