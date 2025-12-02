const API_URL = "http://localhost:3000/api";

async function apiPost(endpoint, data = {}, extraHeaders = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

async function apiGet(endpoint, extraHeaders = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    }
  });

  return res.json();
}

async function apiDelete(endpoint, extraHeaders = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    }
  });

  return res.json();
}

async function apiPut(endpoint, data = {}, extraHeaders = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

async function apiPatch(endpoint, body = {}, headers = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...headers
        },
        body: JSON.stringify(body)
    });

    return res.json();
}
