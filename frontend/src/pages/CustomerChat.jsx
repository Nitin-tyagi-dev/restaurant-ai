import { useEffect, useMemo, useRef, useState } from "react";
import ChatBubble from "../components/ChatBubble.jsx";
import OrderCard from "../components/OrderCard.jsx";
import { chat, placeOrder } from "../api/api.js";

function extractOrderConfirmed(text) {
  const idx = text.indexOf("ORDER_CONFIRMED:");
  if (idx === -1) return null;
  const after = text.slice(idx + "ORDER_CONFIRMED:".length).trim();
  const match = after.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export default function CustomerChat() {
  const [customerName, setCustomerName] = useState("John");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      role: "ai",
      text:
        "Hi! I’m your food assistant. Tell me what you’re craving (veg/non-veg, spicy/mild), and your budget — I’ll recommend the best picks.",
    },
  ]);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const bottomRef = useRef(null);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, confirmedOrder]);

  const canSend = useMemo(() => !loading && input.trim().length > 0, [loading, input]);

  async function handleSend() {
    if (!canSend) return;
    setError("");
    const text = input.trim();
    setInput("");
    setLoading(true);

    setMessages((m) => [...m, { role: "user", text }]);

    try {
      const aiText = await chat({ message: text, customerName });
      setMessages((m) => [...m, { role: "ai", text: aiText }]);

      const order = extractOrderConfirmed(aiText);
      if (order && order.items && typeof order.totalAmount === "number") {
        setConfirmedOrder(order);
      }
    } catch (e) {
      setError("Couldn’t reach the server. Make sure the backend is running on http://localhost:8080.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!confirmedOrder || orderPlaced) return;
    (async () => {
      try {
        await placeOrder({
          customerName: customerName?.trim() || "Guest",
          items: confirmedOrder.items,
          totalAmount: confirmedOrder.totalAmount,
        });
        setOrderPlaced(true);
      } catch {
        setError("Order detected, but auto-submit failed. Please try again.");
      }
    })();
  }, [confirmedOrder, orderPlaced, customerName]);

  return (
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-5xl flex-col px-4">
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 rounded-2xl border bg-white p-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">Customer name</div>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-orange-500"
            placeholder="John"
            disabled={loading}
          />
        </div>
        <div className="hidden sm:block rounded-2xl bg-orange-50 p-3 text-sm text-orange-800">
          Tip: say “veg, medium spicy, under ₹300”
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto rounded-3xl bg-slate-50 p-4 shadow-inner">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <ChatBubble key={i} side={m.role === "user" ? "right" : "left"} text={m.text} />
          ))}

          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                Thinking…
              </div>
            </div>
          ) : null}

          {confirmedOrder ? (
            <div className="pt-2">
              <OrderCard order={confirmedOrder} />
              {orderPlaced ? (
                <div className="mt-2 text-xs text-emerald-700">Order submitted to the restaurant.</div>
              ) : null}
            </div>
          ) : null}

          {error ? <div className="text-sm font-medium text-rose-600">{error}</div> : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mb-4 mt-4 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[48px] w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none focus:border-orange-500 disabled:bg-slate-50"
          placeholder="Type a message…"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="h-12 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}

