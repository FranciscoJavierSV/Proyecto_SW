const {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  applyCoupon
} = require('../models/cart');

const {
  addToCart,
  updateCartItem,
  deleteCartItem,
} = require('../models/products');

const {
  applyCoupon
} = require('../models/coupons');

// Carrito
const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Representa al usuario para poder guardar su carrito
    if(!userId){
      return res.status(400).json({
        success: false,
        message: 'Usuario inválido.'
      });
    }

    const verCarrito = await cart.getCart(); // Función que está en models/cart
    res.json(verCarrito);

  } catch (error) {
    console.error('Error en ver carrito:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productID, quantity } = req.body;
    const userId = req.user.id;
    
    // Validaciones
    if(!productID || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Ingresar ID y cantidad"
      });
    }

    if(quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Cantidad debe ser mayor a 0."
      });
    }

    const exists = await products.getProductId(productID);
    if(!exists){
      return res.status(404).json({
        success: false,
        message: "Producto no existente."
      });
    }

    const add = await cart.addCart(userId, productID, quantity);
    res.json(add);

  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productID } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Validaciones
    if(!productID || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Ingresar ID y cantidad"
      });
    }

    const exists = await products.getProductId(productID);
    if(!exists){
      return res.status(404).json({
        success: false,
        message: "Producto no existente."
      });
    }

    const update = await cart.updateCart(userId, productID, quantity);
    res.json;

  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { productID } = req.params;
    const userId = req.user.id;

    // Validaciones
    if(!prodId){
      return res.status(400).json({
        success: false,
        message: "Ingresar un ID"
      });
    }

    const exists = await products.getProductId(productID);
    if(!exists){
      return res.status(404).json({
        success: false,
        message: "El producto no está en el carrito."
      });
    }

    const eliminado = await cart.deletProduct(userId, productID);
    res.json(eliminado);

  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body;
    const userId = req.user.id;

    // Validaciones
    if(!coupon){
      return res.status(400).json({
        success: false,
        message: "Ingresa el cupón."
      });
    }

    const couponData = await coupons.getCoupon(coupon);

    if (!couponData) {
      return res.status(404).json({
        success: false,
        message: "Cupón inválido o inexistente."
      });
    }

     /*
      Aún falta decidir si el descuento se aplicará:
      - Directamente al carrito
      o
      - Hasta el checkout.

      Por ahora solo validamos el cupón y lo mandamos al modelo
      para que lo registre.
    */

    const cupon = await cart.aplicarCupon(userId, coupon);
    res.json(cupon);

  } catch (error) {
    console.error('Error al aplicar cupón', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  applyCoupon
};