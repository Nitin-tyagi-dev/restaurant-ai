import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 30000,
});

export async function fetchMenu({ includeUnavailable = false } = {}) {
  const res = await api.get("/api/menu", { params: { includeUnavailable } });
  return res.data;
}

export async function createMenuItem(payload) {
  const res = await api.post("/api/menu", payload);
  return res.data;
}

export async function updateMenuItem(id, payload) {
  const res = await api.put(`/api/menu/${id}`, payload);
  return res.data;
}

export async function deleteMenuItem(id) {
  await api.delete(`/api/menu/${id}`);
}

export async function placeOrder({ customerName, items, totalAmount }) {
  const res = await api.post("/api/orders", {
    customerName,
    items: JSON.stringify(items),
    totalAmount,
  });
  return res.data;
}

export async function fetchOrders() {
  const res = await api.get("/api/orders");
  return res.data;
}

export async function updateOrderStatus(id, status) {
  const res = await api.put(`/api/orders/${id}/status`, { status });
  return res.data;
}

export async function chat({ message, customerName }) {
  const res = await api.post("/api/chat", { message, customerName });
  return res.data;
}

