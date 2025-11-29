// Aqui va todo lo relacionado a bases de datos

estructura actual 

Base de datos tienda

tablas 

    productos // Lista todos los articulos
        id          // id del articulo
        nombre      // nombre del articulo
        precio      // precio del articulo
        ofertaP     // precio de oferta
        categoria   // categoria del producto
        inventario  // cantidad en inventario
        imagen
        descripcion // descripcion de producto

    usuarios // Lista todos los usuarios de la pagina
        id          // identificador de usuario
        nombre      // nombre del usuario
        contrasena  // contrasena de la cuenta
        correo      // correo electronico para acceder
        rol         // rol de la cuenta 
        pais        // pais para los impuestos
        preferencias// Las preferencias de accesibilidad de la cuenta (en JSON)
        intentos    // Intentos a su cuenta
        block       // guarfa la hora y fecha de desbloqueo sino hay nada esta desbloqueada
        
    paises // paises de usuarios
        id          // identificador del pais
        nombre      // Nombre del pais
        iva         // Impuesto del pais

    whishlist // Tiene los articulos de la lista de deseos de los usuarios
        id          // identificador de wishlist
        usuario     // nombre de la cuenta (id)
        articulo    // datos de el articulo (id)
        imagen

    cart // Lista los articulos del carrito
        id          // id de carrito
        usuario     // usuario asociado
        articulo    // articulo
        cantidad    // cantidad
        iva         // impuesto por pais
        descuento   // descuento del total
        subtotal    // sin descuento ni iva
        total       // total con lo demas
        imagen
        cupon

    sales // Lista todas las ventas de la pagina 
        id          // id de ventas
        usuario     // usuario asociado 
        fecha       // fecha de venta
        productos   // productos vendidos
        subtotal    // sub total
        descuento   // descuento total
        cupon       // si se ingreso un cupon
        iva         // iva aplica por pais
        total       // total

    sales_items // Especificacion de ventas de un producto
        id                  // id ventas de producto
        sale_id             // id en sales
        producto_id         // id en productos
        cantidad            // cantidad de productos vendidos
        precio_unitario     // Precio al momento de la venta               
        subtotal           // cantidad * precio_unitario

    cupones // Almacena todos los cupones expedidos
        codigo        // Código del cupón (ej. "DESCUENTO10")
        tipo          // Tipo de descuento: 'porcentaje' o 'fijo'
        valor         // Valor del descuento (ej. 10 para 10% o $10)
        expiracion    // Fecha de expiración
        uso_maximo    // Cuántas veces puede usarse
        usado         // Cuántas veces se ha usado
        activo        // Booleano para desactivar sin 
