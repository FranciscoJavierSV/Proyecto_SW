const API_URL = "https://proyecto-production-5301.up.railway.app/api";
//const API_URL = "http://localhost:4000/api";

async function apiPost(endpoint, data) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function apiGet(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}