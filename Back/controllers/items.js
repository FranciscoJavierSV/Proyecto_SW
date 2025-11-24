const {
  getAllProducts,
  getProductsByCategory,
  getProductById
} = require('../models/products');

// Productos
const getAllProducts = async (req, res) => {
  try {
    const allProducts = await products.getProducts(); // Función que está en models/products
    res.json(allProducts);
  } catch (error) {
    console.error('Error en mostrar todos los productos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

  const getProductsByCategory = async (req, res) => {
    try {
      const { categoria } = req.params;

      // Validación de categoría 
      if(!categoria){
        return res.status(400).json({
          success: false,
          message: "Ingresa la categoria valida."
        });
      }

      const product = await products.getProductCategory(categoria);

      if(!product){
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado"
        });
      }
      res.json(product);

    } catch (error) {
      console.error('Error al encontrar producto por categoria:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  };

  const getProductById = async (req, res) => {
    try {
      const { id } = req.params;

      // Validación de id
      if(!id){
        return res.status(400).json({
          success: false,
          message: "Ingresa un ID valido."
        });
      }

      const product = await products.getProductId(id); // Función que está en models/products

      if(!product){
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado"
        });
      }
      res.json(product);

    } catch (error) {
      console.error('Error al encontrar producto por id:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  };

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById
};