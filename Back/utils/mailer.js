const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

console.log("RESEND KEY CARGADA:", process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarCorreo({ to, subject, html, attachments = [] }) {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
      attachments
    });

    console.log("Correo enviado:", data);
    return { success: true };
  } catch (error) {
    console.error("Error enviando correo:", error);
    return { success: false, error };
  }
}

module.exports = { enviarCorreo };