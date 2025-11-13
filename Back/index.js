const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const privRoutes = require('./routes/privRoutes');



// Declaracion de rutas 

// Rutas publicas
app.use('/api/auth', authRoutes);
// Rutas protegidas
app.use('/api/user', userRoutes);
// Rutas de Administracion
app.use('/api/priv', privRoutes);
// Ruta para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

module.exports = app;