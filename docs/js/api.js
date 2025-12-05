// URL base del backend (local, Host )
//const API_URL = "https://proyecto-production-5301.up.railway.app/api";
const API_URL = "http://localhost:3000/api";

// POST genérico (envía datos en JSON)
async function apiPost(endpoint, data = {}, extraHeaders = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Indica que se envía JSON
      ...extraHeaders, // Headers adicionales (ej. Authorization)
    },
    body: JSON.stringify(data), // Convierte el body a JSON
  });

  return res.json(); // Devuelve la respuesta parseada
}

// GET genérico (obtiene datos del backend)
async function apiGet(endpoint, extraHeaders = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json", // Algunos servidores lo aceptan
      ...extraHeaders, // Headers adicionales
    },
  });

  return res.json(); // Devuelve la respuesta parseada
}

// DELETE genérico (elimina recursos)
async function apiDelete(endpoint, extraHeaders = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json", // Tipo de contenido
      ...extraHeaders, // Headers adicionales
    },
  });

  return res.json(); // Devuelve la respuesta parseada
}

// PUT genérico (actualiza recursos completos)
async function apiPut(endpoint, data = {}, extraHeaders = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", // Indica JSON
      ...extraHeaders, // Headers adicionales
    },
    body: JSON.stringify(data), // Datos a actualizar
  });

  return res.json(); // Devuelve la respuesta parseada
}

// PATCH genérico (actualiza parcialmente un recurso)
async function apiPatch(endpoint, body = {}, headers = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json", // Indica JSON
      ...headers, // Headers adicionales
    },
    body: JSON.stringify(body), // Datos parciales
  });

  return res.json(); // Devuelve la respuesta parseada
}