export default function MenuTable({ items, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Veg</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{it.name}</div>
                  {it.description ? (
                    <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">{it.description}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-700">{it.category}</td>
                <td className="px-4 py-3 text-slate-700">₹{Number(it.price || 0).toFixed(0)}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      it.isVeg ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700",
                    ].join(" ")}
                  >
                    {it.isVeg ? "Veg" : "Non-veg"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      it.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {it.isAvailable ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(it)}
                      className="rounded-lg border px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(it)}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No menu items yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

