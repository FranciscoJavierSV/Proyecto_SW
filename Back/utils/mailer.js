const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreo({ to, subject, html, attachments = [] }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments
    });

    return { success: true };
  } catch (err) {
    console.error("Error enviando correo:", err);
    return { success: false, error: err };
  }
}


module.exports = { enviarCorreo };
