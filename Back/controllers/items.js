const products = require('../models/products');

// Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const allProducts = await products.getProducts();

    return res.json({
      success: true,
      products: allProducts
    });

  } catch (error) {
    console.error('Error en mostrar todos los productos:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// Productos por categoría
const getProductsByCategory = async (req, res) => {
  try {
    const { categoria } = req.params;

    if (!categoria || !['bebida','salado','dulce'].includes(categoria)) {
      return res.status(400).json({ success: false, message: "Categoría inválida" });
    }

    const product = await products.getProductCategory(categoria);

    return res.json({
      success: true,
      products: product
    });

  } catch (error) {
    console.error('Error al encontrar producto por categoría:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// Productos por ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Ingresa un ID válido" });
    }

    const product = await products.getProductId(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    return res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error al encontrar producto por id:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById
};
