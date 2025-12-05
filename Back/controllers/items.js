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

// Productos por filtros
async function getProductsbyFilters(req, res) {
  try {
    const { min, max, categoria, oferta } = req.query;

    // 1) Traemos TODOS los productos primero
    let productos = await products.getProducts();

    // 2) Filtrar por categoría
    if (categoria) {
      const categorias = Array.isArray(categoria) ? categoria : [categoria];
      productos = productos.filter(p => categorias.includes(p.categoria));
    }


    // 3) Filtrar por rango de precio
    if (min !== undefined && max !== undefined) {
      const minNum = Number(min);
      const maxNum = Number(max);

      productos = productos.filter(p => {
        const tieneOferta = p.ofertaP && Number(p.ofertaP) > 0;
        const precioReal = tieneOferta ? Number(p.ofertaP) : Number(p.precio);
        return precioReal >= minNum && precioReal <= maxNum;
      });
    }

    // 4) Filtrar por oferta
    if (oferta === "si") {
      productos = productos.filter(p => p.ofertaP && Number(p.ofertaP) > 0);
    } 
    else if (oferta === "no") {
      productos = productos.filter(p => !p.ofertaP || Number(p.ofertaP) === 0);
    }

    // 5) Respuesta final
    res.json({
      success: true,
      products: productos
    });

  } catch (error) {
    console.error("Error en getProductsbyFilters: ", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
}
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
  getProductsbyFilters
};
