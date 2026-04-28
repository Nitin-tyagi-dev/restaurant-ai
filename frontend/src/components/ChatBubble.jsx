export default function ChatBubble({ side = "left", text }) {
  const isRight = side === "right";
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isRight
            ? "bg-orange-500 text-white rounded-br-md"
            : "bg-white text-slate-800 border rounded-bl-md",
        ].join(" ")}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
      </div>
    </div>
  );
}

