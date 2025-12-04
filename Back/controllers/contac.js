const { enviarCorreo } = require('../utils/mailer');
const nodemailer = require("nodemailer");
const path = require("path");
const { createCoupon } = require('../models/cuponModel');
const nodemailer = require('nodemailer');


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

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El correo es requerido para suscribirse"
      });
    }

    // Generar código único para el cupón
    const codigo = "WELCOME-" + Math.floor(Math.random() * 100000);

    // Definir datos del cupón
    const nuevoCupon = {
      codigo,
      tipo: "descuento",
      valor: 10,
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

    // Configurar transporte de correo (ejemplo con Gmail, pero puedes usar SMTP propio)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // tu correo
        pass: process.env.MAIL_PASS  // tu contraseña o app password
      }
    });

    // Definir contenido del correo
    const mailOptions = {
      from: '"Mi Tienda" <no-reply@mitienda.com>',
      to: email,
      subject: '¡Gracias por suscribirte! Aquí está tu cupón 🎁',
      text: `Hola, gracias por suscribirte. Tu cupón es: ${codigo}. 
             Úsalo antes del ${nuevoCupon.expiracion.toLocaleDateString()}.`,
      html: `<p>Hola, gracias por suscribirte 🙌</p>
             <p>Tu cupón es: <b>${codigo}</b></p>
             <p>Úsalo antes del <b>${nuevoCupon.expiracion.toLocaleDateString()}</b>.</p>`
    };

    // Enviar correo
    await transporter.sendMail(mailOptions);

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