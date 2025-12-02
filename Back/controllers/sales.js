// --------------------------- IMPORTS ---------------------------
const sales = require('../models/sales');
const cart = require('../models/cart');
const products = require('../models/products');
const coupons = require('../models/coupons');

// --------------------------- CREAR ORDEN ---------------------------
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener carrito completo del usuario
    const items = await cart.getCart(userId);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tu carrito está vacío"
      });
    }

    // ------------------------
    // 1. Calcular totales
    // ------------------------
    let subtotal = 0;
    let descuento = 0;
    let iva = 0;
    let total = 0;
    let codigoCupon = null;

    for (const item of items) {
      subtotal += item.subtotal;
      descuento += item.descuento;
      iva += item.iva;
      total += item.total;
      if (item.codigo_cupon) codigoCupon = item.codigo_cupon;
    }

    // ------------------------
    // 2. Crear venta
    // ------------------------
    const saleId = await sales.createSale(
      userId,
      subtotal,
      descuento,
      codigoCupon,
      iva,
      total
    );

    // ------------------------
    // 3. Registrar items
    // ------------------------
    let count = 0;

    for (const item of items) {
      await sales.addSaleItem(
        saleId,
        item.producto_id,
        item.cantidad,
        item.subtotal / item.cantidad,
        item.subtotal
      );

      count++;

      // Descontar inventario (usar función segura)
      await products.decreaseInventory(item.producto_id, item.cantidad);
    }

    // Guardar el número total de productos vendidos
    await sales.updateSaleProductCount(saleId, count);

    // ------------------------
    // 4. Marcar el cupón como utilizado
    // ------------------------
    if (codigoCupon) {
      await coupons.usarCupon(codigoCupon);  
    }

    // ------------------------
    // 5. Vaciar carrito - AGREGAR ESTA FUNCIÓN AL MODELO
    // Temporal: eliminar todos los items
    const cartItems = await cart.getCart(userId);
    for (const item of cartItems) {
      await cart.deleteItem(item.id, userId);
    }

    return res.json({
      success: true,
      message: "Compra realizada con éxito",
      saleId
    });

  } catch (error) {
    console.error("Error en createOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

// --------------------------- OBTENER HISTORIAL ---------------------------
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await sales.getUserSales(userId);

    return res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error("Error en getOrders:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

// --------------------------- OBTENER ITEMS DE UNA ORDEN ---------------------------
const getOrderDetails = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await sales.getSaleById(saleId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada"
      });
    }

    const items = await sales.getSaleItems(saleId);

    return res.json({
      success: true,
      sale,
      items
    });

  } catch (error) {
    console.error("Error en getOrderDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

const getOrderPDF = async (req, res) => {
  return res.json({
    success: false,
    message: "Función PDF pendiente"
  });
};

const sendOrderEmail = async (req, res) => {
  return res.json({
    success: false,
    message: "Función email pendiente"
  });
};

// AGREGAR ESTAS FUNCIONES QUE SE USAN EN privRoutes:

const getSalesChart = async (req, res) => {
  try {
    // TODO: Implementar gráfica de ventas
    return res.json({ success: false, message: 'Función pendiente' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const getTotalSales = async (req, res) => {
  try {
    // TODO: Implementar total de ventas
    return res.json({ success: false, message: 'Función pendiente' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// --------------------------- EXPORT ---------------------------
module.exports = {
  createOrder,         
  getOrders,
  getOrderDetails,
  getOrderPDF,
  sendOrderEmail,
  getSalesChart,    
  getTotalSales    
};