const { enviarCorreo } = require('../utils/mailer');
const nodemailer = require("nodemailer");
const path = require("path");


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
    
    enviarCorreo({
      to: process.env.EMAIL_USER, 
      subject: "Nuevo mensaje de contacto - Sexta Armonía",
      html: contenidoHTML_admin
    });

    // CORREO AUTOMÁTICO AL USUARIO 
    const contenidoHTML_usuario = `
    <center>
      <img src="cid:logoCafeteria" width="120">
      <h2 style="color:#8B5E3C;">Sexta Armonía</h2>
      <h4>"Tu café favorito, a un clic de distancia"</h4>
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
      to: correo,
      subject: "Gracias por contactarnos - Sexta Armonía",
      html: contenidoHTML_usuario,
      attachments: [
        {
          filename: "logo.jpg",
          path: "./assets/logo.jpg", 
          cid: "logoCafeteria"       
        }
      ]
    });


    return res.json({ success: true });

  } catch (err) {
    console.error("Error en sendContact:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};


// Funcion para suscribirse en caso de hacerlo 
const subscribe = async ({ nombre, email }) => {
  try {

    if (!email || !nombre) {
      console.error("Faltan datos para suscripción");
      return;
    }

    // Rutas absolutas a imágenes locales
    const logoPath = path.join(process.cwd(), "assets", "logo.jpg");
    const cuponPath = path.join(process.cwd(), "assets", "cupon.jpg");

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Plantilla HTML con imágenes locales
    const contenidoHTML_suscripcion = `
      <center>
        <img src="cid:logoEmpresa" width="120">
        <h2 style="color:#8B5E3C;">${process.env.COMPANY_NAME}</h2>
        <h4>"${process.env.COMPANY_SLOGAN}"</h4>
      </center>

      <p>Hola <strong>${nombre}</strong>,</p>
      <p>¡Gracias por suscribirte a nuestra comunidad! 🎉</p>

      <p>Aquí tienes tu cupón exclusivo:</p>

      <center>
        <img src="cid:imagenCupon" width="300">
      </center>

      <p>Podrás usarlo en tu próxima compra y disfrutar de un descuento especial.</p>

      <br>
      <p>Atentamente,<br><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    // Enviar correo
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Tu cupón de bienvenida - Sexta Armonía",
      html: contenidoHTML_suscripcion,
      attachments: [
        { filename: "logo.png", path: logoPath, cid: "logoEmpresa" },
        { filename: "cupon.png", path: cuponPath, cid: "imagenCupon" }
      ]
    });

    console.log("Correo de suscripción enviado a:", email);

  } catch (error) {
    console.error("Error en suscripción:", error);
  }
};

module.exports = {
  sendContact,
  subscribe
};