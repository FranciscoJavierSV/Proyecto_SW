const { enviarCorreo } = require('../utils/mailer');

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

    // --- 1. CORREO QUE LLEGA AL CAFÉ ---
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

    // --- 2. CORREO AUTOMÁTICO AL USUARIO ---
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
    // Suscribirse y recibir cupón
  } catch (error) {
    // Manejo de errores
  }
};

module.exports = {
  sendContact,
  subscribe
};