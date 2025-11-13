// 08/11/2025 creacion de repo

// Cambios 11/11/2025
    - Equipo agregado
    - Asignaciones
    - esqueleto de distribucion

// Cambios dia 12/11/2025 

- Creacion de APIS del proyecto version 1:
    - creacion de la declaracion de las rutas en index y routes
    - creacion de archivos de distribucion
    - declaracion basica de la API

    + archivos modificados o creados:
        - index.js
        - authRoutes.js
        - privRoutes.js
        - userRoutes.js

//======================== publico =====================================
// Estas no requiren ningun tipo de acceso se pueden utilizar en cualquier momento

// Registro y autenticación
router.post('/register', ...);        // Registro de usuario
router.post('/login', ...);           // Inicio de sesión (funcion de bloqueo por intentos) y retorna el  
                                      // token y nombre de la cuenta para poder mostrar
router.post('/captcha', ...);         // Validación de CAPTCHA
router.post('/recover', ...);         // Solicitud de recuperación
router.post('/reset', ...);           // Confirmación de recuperación

// Productos
router.get('/products', ...);         // Listar todos los productos ( 1categoría, 2 rango de precios 
                                      // y 3 productos en oferta) con esos 3 tipos de parametros.
router.get('/products/:id', ...);     // devuelve un producto en concreto por si quieren mostrar 1 en grande


// Contacto
router.post('/contact', ...);         // Enviar mensaje de contacto 

//======================== privado =====================================
// Estas requieren de estar logeado para funcionar llamar a la API
// requieren la funcion ActiveU (Active User) la cual revisa si es usuario o admin

// Sesión y perfil
router.post('/logout', ...);                // Cerrar sesión
router.get('/perfil', ...);                 // Obtener perfil del usuario

// Carrito
router.get('/cart', ...);                   // Ver carrito
router.post('/cart', ...);                  // Agregar producto
router.patch('/cart/:prodId', ...);         // Modificar cantidad
router.delete('/cart/:prodId', ...);        // Eliminar producto
router.post('/cart/coupon', ...);           // Aplicar cupón

// Órdenes
router.post('/ordenar', ...);               // Finalizar compra
router.get('/ordenar', ...);                // Ver historial
router.get('/ordenar/:id/pdf', ...);        // Generar nota PDF
router.post('/ordenar/:id/email', ...);     // Enviar nota por correo

// Suscripción
router.post('/suscripcion', ...);           // Suscribirse y recibir cupón

// Lista de deseos
router.get('/wishlist', ...);               // Ver lista de deseos
router.post('/wishlist', ...);              // Agregar producto

//======================== Administrador ===============================
// Estas requieren de permisos de administrador para entrar
// Esta revisa si ActiveA (Active Admin ) revisa si es admin la cuenta

// Gestión de productos
router.post('/mProducts', ...);              // Crear producto
router.put('/mProducts/:id', ...);           // Editar producto
router.delete('/mProducts/:id', ...);        // Eliminar producto
router.get('/mProducts/inventory', ...);     // Ver inventario completo

// Métricas y reportes
router.get('/sales/chart', ...);            // Ver gráfica de ventas
router.get('/sales/total', ...);            // Ver total de ventas
router.get('/inventory', ...);              // Ver inventario por categoría
