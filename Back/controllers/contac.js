const { enviarCorreo } = require('../utils/mailer');
const nodemailer = require("nodemailer");
const path = require("path");
const { createCoupon } = require('../models/cuponModel');


// Contacto y suscripción
const sendContact = async (req, res) => {
  try {
    const { nombre, correo, mensaje } = req.body;

    console.log("NUEVO CONTACTO RECIBIDO:");
    console.log("Nombre:", nombre);
    console.log("Correo:", correo);
    console.log("Mensaje:", mensaje);
    console.log("Fecha backend:", new Date().toLocaleString());

    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos del formulario"
      });
    }

    // CORREO QUE LLEGA AL CAFÉ 
    const contenidoHTML_admin = `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Correo:</strong> ${correo}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje}</p>
    `;

    await enviarCorreo({
      to: process.env.EMAIL_USER, 
      subject: "Nuevo mensaje de contacto - Sexta Armonía",
      html: contenidoHTML_admin
    });

    // CORREO AUTOMÁTICO AL USUARIO 
    const contenidoHTML_usuario = `
      <center>
        <img src="https://i.imgur.com/gx6QxzL.png" width="120">
        <h2 style="color:#8B5E3C;">Sexta Armonía</h2>
        <h4>"Armonía que se saborea"</h4>
      </center>

      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Gracias por comunicarte con nosotros. <br>
      <strong>En breve será atendido.</strong></p>

      <p>Tu mensaje recibido fue:</p>
      <blockquote style="background:#f7f3e9;padding:10px;border-left:4px solid #8B5E3C;">
        ${mensaje}
      </blockquote>

      <p>Nos pondremos en contacto lo antes posible.</p>

      <br>
      <p>Atentamente,<br><strong>Sexta Armonía</strong></p>
    `;

    await enviarCorreo({
      to: correo, // <-- Este le llega al USUARIO
      subject: "Gracias por contactarnos - Sexta Armonía",
      html: contenidoHTML_usuario
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("Error en sendContact:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};


// Codigo para hacer la suscripcion
const subscribe = async (req, res) => {
  try {
    const { nombre, email } = req.body;

    if (!email || !nombre) {
      return res.status(400).json({
        success: false,
        message: "Nombre y correo son requeridos para suscribirse"
      });
    }

    // Generar código único para el cupón
    const codigo = "WELCOME-" + Math.floor(Math.random() * 100000);

    // Definir datos del cupón
    const nuevoCupon = {
      codigo,
      tipo: "descuento",
      valor: 10, // ejemplo: 10% de descuento
      expiracion: new Date(Date.now() + 7*24*60*60*1000), // expira en 7 días
      uso_maximo: 1,
      activo: 1
    };

    // Crear el cupón en la base de datos
    const creado = await createCoupon(nuevoCupon);

    if (!creado) {
      return res.status(500).json({
        success: false,
        message: "No se pudo crear el cupón"
      });
    }

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // o tu servidor SMTP
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Plantilla HTML adaptada con logo y estilo de Sexta Armonía
    const contenidoHTML_suscripcion = `
      <center>
        <img src="https://i.imgur.com/gx6QxzL.png" width="120">
        <h2 style="color:#8B5E3C;">Sexta Armonía</h2>
        <h4>"Armonía que se saborea"</h4>
      </center>

      <p>Hola <strong>${nombre}</strong>,</p>
      <p>¡Gracias por suscribirte a nuestra comunidad! 🎉</p>

      <p>Como agradecimiento, aquí tienes tu cupón exclusivo:</p>
      <blockquote style="background:#f7f3e9;padding:10px;border-left:4px solid #8B5E3C;">
        <strong>${codigo}</strong> — válido hasta el <b>${nuevoCupon.expiracion.toLocaleDateString()}</b>
      </blockquote>

      <p>Podrás usarlo en tu próxima compra y disfrutar de un descuento especial.</p>

      <br>
      <p>Atentamente,<br><strong>Sexta Armonía</strong></p>
    `;

    // Enviar correo al usuario
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Tu cupón de bienvenida - Sexta Armonía",
      html: contenidoHTML_suscripcion
    });

    // Responder al frontend
    return res.status(200).json({
      success: true,
      message: `Suscripción exitosa. Cupón enviado a ${email}`,
      coupon: codigo
    });

  } catch (error) {
    console.error("Error en suscripción:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

module.exports = {
  sendContact,
  subscribe
};