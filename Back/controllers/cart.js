// -------------------- IMPORTS --------------------
const cart = require('../models/cart');
const products = require('../models/products');
const coupons = require('../models/coupons');
const { json } = require('express');

// -------------------- CONTROLLERS --------------------

// Obtener carrito del usuario
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await cart.getCart(userId);

    return res.json({
      success: true,
      cart: data.items,
      resumen: data.resumen
    });

  } catch (error) {
    console.error('Error en ver carrito:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};


// Agregar al carrito
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity) {
      return res.status(400).json({ success: false, message: "Ingresar ID y cantidad" });
    }

    // Ver si ya existe en el carrito
    const itemExiste = await cart.getCartItem(userId, productId);

    // 2Si ya está, aumentar cantidad
    if (itemExiste) {
      const nuevaCantidad = itemExiste.cantidad + quantity;
      const actualizado = await cart.updateCart(userId, productId, nuevaCantidad);

      return res.json({
        success: true,
        message: "Cantidad actualizada",
        cantidad: nuevaCantidad
      });
    }

    // Sino, insertar uno nuevo
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

// Actualizar cantidad
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    const item = await cart.getCartItem(userId, productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Producto no está en el carrito" });
    }

    let nuevaCantidad = item.cantidad;

    if (action === "add") nuevaCantidad++;
    if (action === "remove") nuevaCantidad--;

    if (nuevaCantidad <= 0) {
      await cart.deleteItem(item.id, userId);
      return res.json({ success: true, message: "Producto eliminado" });
    }

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


// Eliminar producto
const deleteCartItem = async (req, res) => {
  try {
    const cartId = req.params.id;
    const userId = req.user.id;

    console.log("Eliminar carrito registro:", cartId, "usuario:", userId);

    const result = await cart.deleteItem(cartId, userId);

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


// Aplicar cupón
const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body;
    const userId = req.user.id;

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Ingresa el cupón" });
    }

    const couponData = await coupons.getCoupon(coupon);

    if (!couponData || couponData.activo !== 1) {
      return res.status(404).json({
        success: false,
        message: "Cupón inválido o no activo"
      });
    }

    const cupon = await cart.aplicarCupon(userId, coupon); // <- usar aplicarCupon (modelo)
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
 
// Limpar carrito de compra
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await cart.clearCart(userId);

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
module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  applyCoupon,
  clearCart
};
