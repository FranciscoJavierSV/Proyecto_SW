const products = require('../models/products');

// Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const allProducts = await products.getProducts();

    if (allProducts.length === 0) {
      return res.status(404).json({ success: false, message: "Productos no encontrados" });
    }

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
    const { cat } = req.params;

    if (!cat || !['bebida','salado','dulce'].includes(cat)) {
      return res.status(400).json({ success: false, message: "Categoría inválida" });
    }

    const product = await products.getProductCategory(cat);

    if (product.length === 0) {
      return res.status(404).json({ success: false, message: "Productos no encontrados" });
    }

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

    if (product.length === 0) {
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

// Productos que tienen ofertas
const getProductOfert = async (req, res) => {
  try {

    const product = await products.getOftertas();

    if (product.length === 0) {
      return res.status(404).json({ success: false, message: "No hay productos con descuentos" });
    }

    return res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error al encontrar productos con descuentos:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const getProductsByPriceRange = async (req, res) => {
  try{
    const { min, max } = req.query;

    if(!min || !max){
      return res.status(400).json({ success: false, message: "Debes ingresar min y max en la URL" });
    }

    const products = await productosModel.getProductsByPriceRange(min, max);

    if (product.length === 0) {
      return res.status(404).json({ success: false, message: "No hay productos dentro de ese rango" });
    }

    return res.json({
      success: true,
      products
    });

  }catch{
    console.error("Error al obtener productos por rango:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

// AGREGAR ESTAS FUNCIONES:
// FUNCIONES QUE SOLO EL ADMIN USA

const createProduct = async (req, res) => {
  try {
    const { nombre, precio, ofertaP, categoria, inventario, imagen, descripcion } = req.body;
    const productId = await products.addProduct({ nombre, precio, ofertaP, categoria, inventario, imagen, descripcion });
    return res.json({ success: true, productId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await products.updateProduct(id, req.body);
    return res.json({ success });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await products.deleteProduct(id);
    return res.json({ success });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const getInventory = async (req, res) => {
  try {
    const products_list = await products.getProducts();
    return res.json({ success: true, products: products_list });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const getInventoryByCategory = async (req, res) => {
  try {
    const allProducts = await products.getProducts();
    const byCategory = {};
    allProducts.forEach(p => {
      if (!byCategory[p.categoria]) byCategory[p.categoria] = [];
      byCategory[p.categoria].push(p);
    });
    return res.json({ success: true, data: byCategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,      // NUEVO
  updateProduct,      // NUEVO
  deleteProduct,      // NUEVO
  getInventory,       // NUEVO
  getInventoryByCategory, // NUEVO
  getProductOfert,
  getProductsByPriceRange
};
