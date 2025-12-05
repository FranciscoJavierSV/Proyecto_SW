// -------------------- IMPORTS --------------------
// Modelos que manejan la lógica de base de datos del carrito, productos y cupones
const cart = require('../models/cart');
const products = require('../models/products');
const coupons = require('../models/coupons');
const { json } = require('express');

// -------------------- CONTROLLERS --------------------
 
// Obtener carrito del usuario
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;              // ID del usuario desde el token
    const data = await cart.getCart(userId); // Obtiene items y resumen del carrito

    return res.json({
      success: true,
      cart: data.items,                      // Lista de productos en el carrito
      resumen: data.resumen                  // Totales, descuentos, etc.
    });

  } catch (error) {
    console.error('Error en ver carrito:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};


// Agregar un producto al carrito
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body; // Datos enviados por el cliente
    const userId = req.user.id;

    if (!productId || !quantity) {
      return res.status(400).json({ success: false, message: "Ingresar ID y cantidad" });
    }

    // Verifica si el producto ya está en el carrito
    const itemExiste = await cart.getCartItem(userId, productId);

    // Si ya existe, solo aumenta la cantidad
    if (itemExiste) {
      const nuevaCantidad = itemExiste.cantidad + quantity;
      const actualizado = await cart.updateCart(userId, productId, nuevaCantidad);

      return res.json({
        success: true,
        message: "Cantidad actualizada",
        cantidad: nuevaCantidad
      });
    }

    // Si no existe, lo agrega como nuevo registro
    const add = await cart.addCart(userId, productId, quantity);

    return res.json({
      success: true,
      message: "Producto agregado",
      data: add
    });

  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

// Actualizar cantidad de un producto en el carrito
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params; // ID del producto
    const { action } = req.body;      // "add" o "remove"
    const userId = req.user.id;

    const item = await cart.getCartItem(userId, productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Producto no está en el carrito" });
    }

    let nuevaCantidad = item.cantidad;

    // Ajusta la cantidad según la acción
    if (action === "add") nuevaCantidad++;
    if (action === "remove") nuevaCantidad--;

    // Si la cantidad llega a 0, elimina el producto del carrito
    if (nuevaCantidad <= 0) {
      await cart.deleteItem(item.id, userId);
      return res.json({ success: true, message: "Producto eliminado" });
    }

    // Actualiza la cantidad en BD
    await cart.updateCart(userId, productId, nuevaCantidad);

    return res.json({
      success: true,
      cantidad: nuevaCantidad
    });

  } catch (error) {
    console.error("Error al actualizar carrito:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};


// Eliminar un producto del carrito
const deleteCartItem = async (req, res) => {
  try {
    const cartId = req.params.id; // ID del registro en el carrito
    const userId = req.user.id;

    console.log("Eliminar carrito registro:", cartId, "usuario:", userId);

    const result = await cart.deleteItem(cartId, userId);

    // Si no afectó filas, no existía o no pertenecía al usuario
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No se pudo eliminar. Puede que el producto no exista."
      });
    }

    return res.json({
      success: true,
      message: "Producto eliminado del carrito."
    });

  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar producto"
    });
  }
};


// Aplicar cupón de descuento al carrito
const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body; // Código del cupón
    const userId = req.user.id;

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Ingresa el cupón" });
    }

    const couponData = await coupons.getCoupon(coupon); // Busca cupón en BD

    // Validación del cupón
    if (!couponData || couponData.activo !== 1) {
      return res.status(404).json({
        success: false,
        message: "Cupón inválido o no activo"
      });
    }

    // Aplica el cupón al carrito del usuario
    const cupon = await cart.aplicarCupon(userId, coupon);

    return res.json({
      success: true,
      data: cupon
    });

  } catch (error) {
    console.error('Error al aplicar cupón:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};
 
// Limpiar todo el carrito del usuario
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await cart.clearCart(userId); // Elimina todos los registros del carrito

    return res.json({
      success: true,
      message: "Carrito limpiado correctamente"
    });

  } catch (error) {
    console.error("Error al limpiar carrito:", error);
    return res.status(500).json({
      success: false,
      message: "Error al limpiar carrito"
    });
  }
};

// -------------------- EXPORTS --------------------
// Exporta todos los controladores para usarlos en las rutas
module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  applyCoupon,
  clearCart
};