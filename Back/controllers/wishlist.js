// -------------------- IMPORTS --------------------
const wishlist = require('../models/wishlist');
const products = require('../models/products');

// ===============================
// OBTENER WISHLIST DEL USUARIO
// ===============================
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const list = await wishlist.getWishlist(userId);

    return res.json({
      success: true,
      data: list
    });

  } catch (error) {
    console.error("Error en getWishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

// ===============================
// AGREGAR A WISHLIST
// ===============================
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar el ID del producto"
      });
    }

    // Validar que el producto exista
    const product = await products.getProductId(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    // Agregar producto
    const result = await wishlist.addItem(userId, productId);

    if (result.already) {
      return res.status(200).json({
        success: true,
        message: "El producto ya está en tu lista de deseos"
      });
    }

    return res.json({
      success: true,
      message: "Producto agregado a la lista de deseos"
    });

  } catch (error) {
    console.error("Error en addToWishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

// ===============================
// ELIMINAR DE WISHLIST
// ===============================
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar el ID del producto"
      });
    }

    const deleted = await wishlist.removeItem(userId, productId);

    if (deleted.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Este producto no estaba en tu lista"
      });
    }

    return res.json({
      success: true,
      message: "Producto eliminado de la lista de deseos"
    });

  } catch (error) {
    console.error("Error en removeFromWishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

// -------------------- EXPORTS --------------------
module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
