import { useEffect, useMemo, useState } from "react";
import MenuTable from "../components/MenuTable.jsx";
import {
  createMenuItem,
  deleteMenuItem,
  fetchMenu,
  fetchOrders,
  updateMenuItem,
  updateOrderStatus,
} from "../api/api.js";

function safeParseItems(itemsStr) {
  try {
    const v = JSON.parse(itemsStr);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function OwnerDashboard() {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Starter",
    isVeg: true,
    isAvailable: true,
  });

  const isEditing = useMemo(() => Boolean(editing?.id), [editing]);

  async function loadMenu() {
    setLoadingMenu(true);
    try {
      const data = await fetchMenu({ includeUnavailable: true });
      setMenu(data);
    } catch {
      setError("Failed to load menu. Is the backend running on http://localhost:8080?");
    } finally {
      setLoadingMenu(false);
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    loadMenu();
    loadOrders();
    const id = setInterval(loadOrders, 10000);
    return () => clearInterval(id);
  }, []);

  function resetForm() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "Starter",
      isVeg: true,
      isAvailable: true,
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      isVeg: Boolean(form.isVeg),
      isAvailable: Boolean(form.isAvailable),
    };
    if (!payload.name || !payload.category || Number.isNaN(payload.price)) {
      setError("Please enter a valid name, category, and price.");
      return;
    }

    try {
      if (isEditing) {
        await updateMenuItem(editing.id, payload);
      } else {
        await createMenuItem(payload);
      }
      await loadMenu();
      resetForm();
    } catch {
      setError("Save failed. Please try again.");
    }
  }

  function onEdit(item) {
    setEditing(item);
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      category: item.category || "Starter",
      isVeg: Boolean(item.isVeg),
      isAvailable: Boolean(item.isAvailable),
    });
  }

  async function onDelete(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setError("");
    try {
      await deleteMenuItem(item.id);
      await loadMenu();
    } catch {
      setError("Delete failed.");
    }
  }

  async function onChangeStatus(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch {
      setError("Status update failed.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">Menu management</div>
              <div className="text-sm text-slate-500">Create, edit, or disable items.</div>
            </div>
            <button
              onClick={loadMenu}
              className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {loadingMenu ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">Loading menu…</div>
          ) : (
            <MenuTable items={menu} onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{isEditing ? "Edit item" : "Add new item"}</div>
                <div className="text-xs text-slate-500">Primary color: warm orange</div>
              </div>
              {isEditing ? (
                <button
                  onClick={resetForm}
                  className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-600">Name</div>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-orange-500"
                  placeholder="Paneer Tikka"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Description</div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:border-orange-500"
                  rows={3}
                  placeholder="Short, tasty description…"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600">Price (₹)</div>
                  <input
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-orange-500"
                    placeholder="220"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Category</div>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-orange-500"
                  >
                    <option>Starter</option>
                    <option>Main Course</option>
                    <option>Drink</option>
                    <option>Dessert</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-3 py-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={form.isVeg}
                    onChange={(e) => setForm((f) => ({ ...f, isVeg: e.target.checked }))}
                    className="h-4 w-4 accent-orange-500"
                  />
                  Veg
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
                    className="h-4 w-4 accent-orange-500"
                  />
                  Available
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600"
              >
                {isEditing ? "Save changes" : "Add item"}
              </button>

              {error ? <div className="text-sm font-medium text-rose-600">{error}</div> : null}
            </form>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Orders</div>
            <div className="text-sm text-slate-500">Auto-refreshes every 10 seconds.</div>
          </div>
          <button
            onClick={loadOrders}
            className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loadingOrders ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">Loading orders…</div>
        ) : (
          <div className="grid gap-3">
            {orders.map((o) => {
              const items = safeParseItems(o.items);
              return (
                <div key={o.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        #{o.id} · {o.customerName}
                      </div>
                      <div className="text-xs text-slate-500">
                        Total: ₹{Number(o.totalAmount || 0).toFixed(0)} · Created:{" "}
                        {o.createdAt ? String(o.createdAt).replace("T", " ") : "—"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {o.status}
                      </span>
                      <select
                        value={o.status}
                        onChange={(e) => onChangeStatus(o.id, e.target.value)}
                        className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-orange-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {items.length ? (
                      items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm text-slate-700">
                          <div>
                            <span className="font-medium text-slate-900">{it.name || it.item || "Item"}</span>
                            {it.qty ? <span className="text-slate-500"> × {it.qty}</span> : null}
                          </div>
                          {typeof it.price === "number" ? <div>₹{it.price.toFixed(0)}</div> : null}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">Items data not available.</div>
                    )}
                  </div>
                </div>
              );
            })}
            {orders.length === 0 ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">No orders yet.</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

