import { Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import CustomerChat from "./pages/CustomerChat.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";

function TopNav() {
  const location = useLocation();
  const isOwner = location.pathname.startsWith("/owner");

  return (
    <div className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-orange-500 shadow" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Spice Garden</div>
            <div className="text-xs text-slate-500">AI Menu & Orders</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner ? (
            <Link
              to="/"
              className="rounded-xl border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Customer
            </Link>
          ) : (
            <Link
              to="/owner"
              className="rounded-xl bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-orange-600"
            >
              Owner Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-full">
      <TopNav />
      <Routes>
        <Route path="/" element={<CustomerChat />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

