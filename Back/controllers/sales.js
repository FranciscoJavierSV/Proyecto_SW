const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

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
  try {
    const {
      customerName,
      customerEmail,
      items,
      subtotal,
      tax,
      shipping,
      coupon,
      total,
    } = req.body;

    if (!customerName || !customerEmail || !items || !subtotal || !total) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios.",
      });
    }

    // Crear PDF temporal
    const pdfName = `order_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, "..", "tmp", pdfName);

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // ENCABEZADO - Datos de la compañia
    const logoPath = path.join(
      __dirname,
      "..",
      "docs",
      "ImagenesPrincipal",
      "f4e7e872-b0d1-4d62-855f-eddcf3595a47.jpg"
    );

    // Insertar logo si existe
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 40, { width: 80 });
    }

    doc
      .fontSize(20)
      .text(process.env.COMPANY_NAME || "Nombre de la Compañía", 140, 50)
      .fontSize(12)
      .text(
        `"${process.env.COMPANY_SLOGAN || "Nuestro lema va aquí"}"`,
        140,
        75
      );

    // Fecha y hora
    doc
      .fontSize(10)
      .text(`Fecha: ${new Date().toLocaleDateString()}`, 40, 130)
      .text(`Hora: ${new Date().toLocaleTimeString()}`);

    doc.moveDown(2);

    // DATOS DEL CLIENTE
    doc
      .fontSize(16)
      .text("Información del Cliente")
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Nombre: ${customerName}`)
      .moveDown();

    // ITEMS DEL CARRITO
    doc
      .fontSize(16)
      .text("Detalles de la Compra")
      .moveDown();

    items.forEach((item, idx) => {
      doc
        .fontSize(12)
        .text(
          `${idx + 1}. ${item.name} | Cant: ${item.quantity} | Precio: $${item.price} | Total: $${(
            item.price * item.quantity).toFixed(2)}`
        );
    });

    doc.moveDown(2);

    // RESUMEN DEL COBRO
    doc
      .fontSize(16)
      .text("Resumen de Pago")
      .moveDown(0.5);

    doc.fontSize(12).text(`Subtotal: $${subtotal}`);
    doc.text(`Impuestos: $${tax || 0}`);
    doc.text(`Envío: $${shipping || 0}`);

    if (coupon) {
      doc.text(`Cupón aplicado: -$${coupon}`);
    }

    doc.moveDown(0.5);
    doc.fontSize(14).text(`TOTAL: $${total}`, { bold: true });

    // Finalizar PDF
    doc.end();

    // ENVIAR
    stream.on("finish", async () => {
      await sendOrderEmail(customerName, customerEmail, pdfPath);

      res.status(200).json({
        success: true,
        message: "PDF generado y correo enviado.",
        pdfFile: pdfName,
      });

      // Eliminar archivo temporal
      fs.unlink(pdfPath, () => {});
    });

  } catch (error) {
    console.error("Error en getOrderPDF:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error al generar PDF" });
  }
};


const sendOrderEmail = async (customerName, customerEmail, pdfPath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      },
    });

    await transporter.sendMail({
      from: `"Tienda" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Resumen de tu compra",
      html: `
        <p>Hola <strong>${customerName}</strong>,</p>
        <p>¡Gracias por tu compra! Te enviamos el resumen de tu pedido adjunto en PDF.</p>
      `,
      attachments: [
        { 
          filename: "order.pdf", 
          path: pdfPath 
        }
      ],
    });

    console.log("Correo enviado correctamente");

  } catch (error) {
    console.error("Error enviando email:", error);
    return res.status(500).json({ success:false, message: "Error al enviar el PDF" });
  }
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