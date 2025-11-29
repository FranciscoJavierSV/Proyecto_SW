// Órdenes/Ventas
const { createOrder, getOrdersByUser, getOrderDetails } = require('../models/sales');
const { getCart, deleteCart } = require('../models/cart');
const { getProductId } = require('../models/products');
const { getUserById } = require('../models/users');

// crear nueva orden desde el carrito
const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body; // cupón opcional desde frontend

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.'
      });
    }

    // obtener carrito del usuario
    const cartItems = await getCart(userId);
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío.'
      });
    }

    // obtener país del usuario
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    // validar productos y construir items
    const validatedItems = [];
    for (const item of cartItems) {
      const product = await getProductId(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto ${item.productId} no encontrado.`
        });
      }

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.precio
      });
    }

    // crear orden con cálculos completos
    const orderData = await createOrder(userId, validatedItems, user.pais, couponCode);

    // limpiar carrito del usuario
    await deleteCart(userId);

    return res.status(200).json({
      success: true,
      message: 'Orden creada exitosamente.',
      orderId: orderData.orderId,
      subtotal: orderData.subtotal,
      descuento: orderData.descuento,
      iva: orderData.iva,
      total: orderData.total,
      cupon: orderData.couponUsed
    });

  } catch (error) {
    console.error('Error al crear orden:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// obtener órdenes del usuario
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.'
      });
    }

    const orders = await getOrdersByUser(userId);
    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// obtener detalles de una orden
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden requerido.'
      });
    }

    const details = await getOrderDetails(orderId);
    if (!details || details.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      details
    });

  } catch (error) {
    console.error('Error al obtener detalles de orden:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// generar PDF de orden
// TODO: implementar generación de PDF (usar librería como pdfkit o puppeteer)
const getOrderPDF = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden requerido.'
      });
    }

    // TODO: validar que la orden pertenece al usuario autenticado
    // TODO: generar PDF con detalles de la orden
    // TODO: devolver PDF como descarga o attachment

    return res.status(501).json({
      success: false,
      message: 'Función no implementada aún.'
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// enviar orden por email
// TODO: implementar envío de email con detalles de la orden (usar nodemailer)
const sendOrderEmail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden requerido.'
      });
    }

    // TODO: obtener detalles de la orden
    // TODO: construir template de email
    // TODO: enviar email con nodemailer

    return res.status(501).json({
      success: false,
      message: 'Función no implementada aún.'
    });
  } catch (error) {
    console.error('Error al enviar email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  createOrderFromCart,
  getOrders,
  getOrderById,
  getOrderPDF,
  sendOrderEmail
};