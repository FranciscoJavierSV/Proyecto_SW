const Pais = require('../models/paises');

async function listarPaises(req, res) {
  try {
    const paises = await Pais.getPaises();
    res.json({ success: true, paises });
  } catch (error) {
    console.error("Error al obtener países:", error);
    res.status(500).json({ success: false, message: "Error al obtener los países" });
  }
}

module.exports = { listarPaises };
