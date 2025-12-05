const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const bwipjs = require("bwip-js");
const { v4: uuidv4 } = require("uuid");
 
// --------------------------- IMPORTS ---------------------------
const sales = require('../models/sales.js');
const cart = require('../models/cart.js');
const products = require('../models/products.js');
const coupons = require('../models/coupons.js');
const pool = require("../db/conexion.js");  

// --------------------------- CREAR ORDEN ---------------------------
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customerName, customerEmail, metodoPago } = req.body;
    // Obtener carrito completo del usuario
    const cartData = await cart.getCart(userId);
    const items = cartData.items; 

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

    // Normalizar valores del carrito: convertir strings formateados a números reales
    for (const item of items) {
      item.subtotal = Number(item.subtotal) || 0;
      item.descuento = Number(item.descuento) || 0;
      item.iva = Number(item.iva) || 0;
      item.total = Number(item.total) || 0;
    }


    for (const item of items) {
      subtotal += item.subtotal;
      descuento += item.descuento;
      iva += item.iva;
      if (item.codigo_cupon) codigoCupon = item.codigo_cupon;
    }

    const [[usuario]] = await pool.query(
      `SELECT pais_id FROM usuarios WHERE id = ?`,
      [req.user.id]
    );

    if (!usuario) {
      return res.status(400).json({ success: false, message: "Usuario no encontrado" });
    }

    const [[pais]] = await pool.query(
      `SELECT iva, envio FROM paises WHERE id = ?`,
      [usuario.pais_id]
    );

    if (!pais) {
      return res.status(400).json({ success: false, message: "País no encontrado" });
    }

    const ivaRate = Number(pais.iva);
    const envio = Number(pais.envio);
    const base = subtotal + envio;
    total = Number((base * (1 + ivaRate)).toFixed(2));

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

    console.log(">>> Items del carrito recibidos en createOrder:");
    console.log(items);

    for (const item of items) {

      console.log(">>> Restando inventario de producto:", item.producto_id, "cantidad:", item.cantidad);

      const product = await products.getProductById(item.producto_id);

      await sales.addSaleItem(
        saleId,
        item.producto_id,
        product.categoria,              
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
    for (const item of cartItems.items) {
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
  try {
    const {
      customerName,
      customerEmail,
      items,
      metodoPago
    } = req.body;

    // Validación básica
    if (
      !customerName ||
      !customerEmail ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      metodoPago === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios.",
      });
    }

    // Obtener país del usuario
    const [[usuario]] = await pool.query(
      `SELECT pais_id FROM usuarios WHERE id = ?`,
      [req.user.id]
    );

    if (!usuario) {
      return res.status(400).json({ success: false, message: "Usuario no encontrado" });
    }

    const [[pais]] = await pool.query(
      `SELECT iva, envio FROM paises WHERE id = ?`,
      [usuario.pais_id]
    );

    if (!pais) {
      return res.status(400).json({ success: false, message: "País no encontrado" });
    }

    const ivaRate = Number(pais.iva);
    const envio = Number(pais.envio);

    // Calcular subtotal
    const subtotal = items.reduce((acc, it) => {
      const cantidad = it.cantidad || 1;
      const precio = it.precioUnitario ?? (it.subtotal / cantidad);
      return acc + (precio * cantidad);
    }, 0);

    const base = subtotal + envio;
    const total = Number((base * (1 + ivaRate)).toFixed(2));

    // ============================
    // PREPARAR CÓDIGO DE BARRAS (SI ES OXXO)
    // ============================
    let oxxoReference = null;
    let barcodeBuffer = null;

    if (metodoPago === "oxxo") {
      oxxoReference = uuidv4().replace(/-/g, "").slice(0, 12);

      try {
        barcodeBuffer = await bwipjs.toBuffer({
          bcid: "code128",
          text: oxxoReference,
          scale: 3,
          height: 15,
          includetext: true,
          textxalign: "center",
        });
      } catch (err) {
        console.warn("WARN: No se pudo generar código de barras:", err.message);
      }
    }

    // ============================
    // CREAR PDF EN MEMORIA
    // ============================
    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      const buffer = Buffer.concat(buffers);
      const pdfBase64 = buffer.toString("base64");

      // Responder al frontend
      res.json({
        success: true,
        message: "PDF generado (y se intentará enviar por correo).",
        pdfBase64
      });

      // Enviar correo en segundo plano
      try {
        let transporter;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          const testAccount = await nodemailer.createTestAccount();
          transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
          });
          console.log("Usando cuenta de prueba Ethereal para el correo de la orden.");
        } else {
          transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });
        }

        const info = await transporter.sendMail({
          from: `"${process.env.COMPANY_NAME || "Tienda"}" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
          to: customerEmail,
          subject: "Resumen de tu compra",
          html: `<p>Hola <strong>${customerName}</strong>,</p><p>Gracias por tu compra. Adjunto encontrarás la nota de compra en PDF.</p>`,
          attachments: [
            { filename: "order.pdf", content: buffer, contentType: "application/pdf" }
          ]
        });

        console.log("✅ Correo de orden enviado. messageId:", info && info.messageId);

        if (nodemailer.getTestMessageUrl && info) {
          console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
        }

      } catch (mailErr) {
        console.error("❌ ERROR al enviar email de orden:", mailErr);
      }
    });

    // ============================
    // CONTENIDO DEL PDF
    // ============================

    // Encabezado: logo + nombre + lema
    const logoPath = path.join(__dirname, "..", "assets", "logo.jpg");
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 40, 40, { width: 80 });
      } catch (err) {
        console.warn("WARN: No se pudo insertar logo en PDF:", err.message);
      }
    }

    doc
      .fontSize(20)
      .text(process.env.COMPANY_NAME || "Sexta Armonía", 140, 50)
      .fontSize(12)
      .text(`"${process.env.COMPANY_SLOGAN || "Tu café favorito a un clic de distancia"}"`, 140, 75);

    const now = new Date();
    doc
      .fontSize(10)
      .text(`Fecha: ${now.toLocaleDateString()}`, 40, 130)
      .text(`Hora: ${now.toLocaleTimeString()}`);

    doc.moveDown(2);

    // Información del cliente
    doc.fontSize(16).text("Información del Cliente").moveDown(0.5);
    doc.fontSize(12).text(`Nombre: ${customerName}`).moveDown();

    // Detalles de la compra
    doc.fontSize(16).text("Detalles de la Compra").moveDown();
    items.forEach((item, idx) => {
      const cantidad = item.cantidad || 1;
      const precioUnitario =
        item.precioUnitario ?? (item.subtotal ? item.subtotal / cantidad : 0);
      const totalItem =
        item.total ?? item.subtotal ?? (precioUnitario * cantidad);

      doc
        .fontSize(12)
        .text(
          `${idx + 1}. ${item.nombre || item.title || "Producto"} | Cant: ${cantidad} | Precio: $${Number(
            precioUnitario
          ).toFixed(2)} | Total: $${Number(totalItem).toFixed(2)}`
        );
    });

    doc.moveDown(2);

    // Resumen de pago
    doc.fontSize(16).text("Resumen de Pago").moveDown(0.5);
    doc.fontSize(12).text(`Subtotal: $${subtotal.toFixed(2)}`);
    doc.text(`Envío: $${envio.toFixed(2)}`);
    doc.text(`IVA (${ivaRate * 100}%): $${(base * ivaRate).toFixed(2)}`);
    doc.moveDown(0.5);
    doc.fontSize(14).text(`TOTAL: $${total.toFixed(2)}`);

    doc.moveDown(2);

    // Sección OXXO (solo si aplica)
    if (metodoPago === "oxxo") {
      doc.fontSize(18).text("PAGO EN OXXO").moveDown();
      doc.fontSize(12).text("Presenta este código en caja para realizar tu pago.").moveDown();

      if (barcodeBuffer) {
        doc.image(barcodeBuffer, { width: 260 });
      } else {
        doc.fontSize(10).text("No se pudo generar el código de barras.").moveDown();
      }

      doc.moveDown(1);
      doc.fontSize(12).text(`Referencia: ${oxxoReference}`);
      doc.moveDown(1);
    }

    // Cerrar el PDF (esto dispara luego el evento "end")
    doc.end();

  } catch (error) {
    console.error("ERROR PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Error al generar PDF",
      error: error.message
    });
  }
};


// --------------------------- GRÁFICA DE VENTAS ---------------------------
const getSalesChart = async (req, res) => {
  try {
    const categorias = await sales.getSalesByCategory();

    return res.json({
      success: true,
      categorias
    });

  } catch (error) {
    console.error("Error en getSalesChart:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

const getTotalCompanySales = async (req, res) => {
  try {
    const total = await sales.getCompanyTotalSales();

    return res.json({
      success: true,
      totalGeneral: total
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el total general'
    });
  }
};


const getSalesProducts = async (req, res) => {
  try {
    const rows = await sales.getSalesByProduct();

    // Ordenar por categorías
    const categorias = {
      bebida: [],
      salado: [],
      dulce: [] 
    };

    rows.forEach(r => {
      if (categorias[r.categoria]) {
        categorias[r.categoria].push(r);
      }
    });

    return res.json({
      success: true,
      categorias
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error obteniendo datos'
    });
  }
}

// --------------------------- EXPORT ---------------------------
module.exports = {
  createOrder,         
  getOrders,
  getOrderDetails,
  getOrderPDF,
  getSalesChart,    
  getSalesProducts,
  getTotalCompanySales
};