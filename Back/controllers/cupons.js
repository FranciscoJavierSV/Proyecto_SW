const coupons = require('../models/coupons');

// ===============================
// OBTENER DATOS DE UN CUPÓN
// ===============================
const getCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar un código de cupón"  
      });
    }

    const coupon = await coupons.getCoupon(code);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Cupón no encontrado"
      });
    }

    return res.json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error("Error al obtener cupón:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

// ===============================
// VALIDAR CUPÓN (FRONTEND)
// ===============================
const validateCoupon = async (req, res) => {
  try {
    const code = req.body.cupon || req.body.code;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Código requerido"
      });
    }

    const coupon = await coupons.validateCoupon(code);

    if (!coupon.valid) {
      return res.status(400).json({
        success: false,
        message: coupon.message
      });
    }

    return res.json({
      success: true,
      data: coupon.coupon
    });

  } catch (error) {
    console.error("Error al validar cupón:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};


// ===============================
// ADMIN — CREAR CUPÓN
// ===============================
const createCoupon = async (req, res) => {
  try {
    const { codigo, tipo, valor, expiracion, uso_maximo, activo } = req.body;

    if (!codigo || !tipo || !valor || !expiracion) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos"
      });
    }

    const created = await coupons.createCoupon({
      codigo,
      tipo,
      valor,
      expiracion,
      uso_maximo: uso_maximo || 1,
      activo: activo ?? 1
    });

    if (!created) {
      return res.status(500).json({
        success: false,
        message: "No se pudo crear el cupón"
      });
    }

    return res.json({
      success: true,
      message: "Cupón creado correctamente"
    });

  } catch (error) {
    console.error("Error en createCoupon:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

// ===============================
// ADMIN — DESACTIVAR CUPÓN
// ===============================
const deactivateCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    const updated = await coupons.disableCoupon(code);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Cupón no encontrado o ya estaba desactivado"
      });
    }

    return res.json({
      success: true,
      message: "Cupón desactivado"
    });

  } catch (error) {
    console.error("Error al desactivar cupón:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
};

// ===============================
// ADMIN — LISTAR CUPONES
// ===============================
const listCoupons = async (req, res) => {
  try {
    const list = await coupons.getAllCoupons();

    return res.json({
      success: true,
      data: list
    });

  } catch (error) {
    console.error("Error al listar cupones:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

// EXPORTS
module.exports = {
  getCoupon,
  validateCoupon,
  createCoupon,
  deactivateCoupon,
  listCoupons
};
