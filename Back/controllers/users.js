// usar el jwt
const jwt = require('jsonwebtoken');
// es para la encriptacion de las contrasenas 
const bcrypt = require('bcrypt');
// usar los metodos que se comunican con las base de datos
const { findUserByName } = require('../model/users');
// palabra oculta
const JWT_SECRET = process.env.JWT_SECRET;


const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    // Comprueba soi ingresaron datos
    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // obtiene el usuario de la base de datos
    const user = await findUser(correo);

    // Si no existe el usuario o la contraseña no coincide, falla sin especificar
    const passwordMatch = user ? await bcrypt.compare(password, user.contrasena) : false;
    if (!user || !passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Datos inválidos'
      });
    }
    // se genera el token
    const token = jwt.sign(
      {
        username: user.nombre,
        role: user.rol
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    // regresa si fue exitoso 
    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        username: user.nombre,
        role: user.rol
      }
    });
    // envia mensaje de error del servidor 
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

const newUser = async (req, res ) => {
  const { username, password, correo, pais } = req.body;
  // Agregar la logica de almacenar los usuarios a la base de datos
  try{
  const correoB = await findEmail(correo);
  // Consultar si el correo existe para evitar duplicados
  if (correoB) {
      return res.status(401).json({
        success: false,
        message: 'Correo ya registrado'
      });
    }
  // Si no esta el correo registrado continuar con el registro
  // asignar conf basica de accesibilidad
    const user = {username,password,correo,pais};

    const success = await createUser(user);

    if(!success){
      return res.status(500).json({
        success: false,
        message: 'Error de creacion, intente mas tarde'
      });
    }

  // una vez agregado
  return res.status(200).json({
      success: true,
      message: ' Usuario Registrado con exito ',
    });
  // En caso de error de conexion
  }catch(error){
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

const recoveryUser = async (req, res ) => {
  // esto viene despues decompletar el captcha y agregar el correo a recuperar
  const { correo, captchaT } = req.body;
  // Aqui el recuperar usuario
  try{
    // Verificar que llego el correo
    if(!captchaT){
      return res.status(401).json({
        success: false,
        message: 'Completa el captcha para continuar'
      });
    }
    // Verificar que llego el correo
    if(!correo){
      return res.status(401).json({
        success: false,
        message: 'Ingrese el correo en el campo'
      });
    }
  // logica de recuperar contrasena 
    //enviar correo con url y token de expiracion para el cambio de contra


  // si no retorna un error   
  }catch(error){
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

const editUser = async (req, res ) => {
  const { token, type } = req.body;
  // Aqui editar usuario ya sea el pais/preferencias/
  // dependiendo de una variable del request
  try{
    // revisa si llegaron los datos
    if(!type || !token){
      return res.status(401).json({
        success: false,
        message: 'Falta de datos'
      });
    }
    // logica para cada tipo de request



  // si no retorna un error 
  }catch(error){
    console.error('Error interno');
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor intente mas tarde'
    });
  }
};

const restore = async (req, res) => {
// token que expira para el cambio enviado por la url
 const {token} = req.body;
try{
  // Cambia la contra del usuario en la base dedatos

}catch(error){

}
};


module.exports = {
  login, newUser, recoveryUser, editUser, logOut, restore
};