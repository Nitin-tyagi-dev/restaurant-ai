function formatINR(amount) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}
export default function OrderCard({ order }) {
  if (!order) return null;
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Order confirmed</div>
          <div className="text-xs text-slate-500">We’ve placed it for you.</div>
        </div>
        <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          {formatINR(order.totalAmount)}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {(order.items || []).map((it, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-sm">
            <div className="text-slate-800">
              <span className="font-medium">{it.name || it.item || "Item"}</span>
              {it.qty ? <span className="text-slate-500"> × {it.qty}</span> : null}
            </div>
            {typeof it.price === "number" ? (
              <div className="text-slate-600">{formatINR(it.price)}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

