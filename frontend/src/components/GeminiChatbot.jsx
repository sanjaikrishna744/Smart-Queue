import { useEffect, useRef, useState } from "react";
import "./GeminiChatbot.css";

export default function GeminiChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi machi 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages((m) => [...m, { role: "user", text: userText }]);

    try {
      const res = await fetch("http://localhost:5000/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setMessages((m) => [
        ...m,
        { role: "bot", text: data.reply || "No reply machi 😕" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Server error machi 😕" },
      ]);
    }
  };

  return (
    <div className="chatbot-float">
      {/* HEADER */}
      <div className="chatbot-header">
        <span>🤖 Gemini Assistant</span>
        <button onClick={onClose}>✕</button>
      </div>

      {/* MESSAGES */}
      <div className="chatbot-body">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="chatbot-input">
        <input
          type="text"
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}