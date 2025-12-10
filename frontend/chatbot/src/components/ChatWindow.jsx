import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import api from "../services/api";
import CodeBlock from "./CodeBlock";

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("en");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setError("");
        const res = await api.get("/chat/messages");
        setMessages(res.data);
      } catch (err) {
        console.error("Fetch messages failed", err.response?.data || err.message);
        setError(err.response?.data?.message || "Unable to load messages");
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const container = listRef.current;
    container.scrollTop = container.scrollHeight;

    const items = container.querySelectorAll("[data-message-id]");
    const last = items[items.length - 1];
    if (last) {
      gsap.fromTo(
        last,
        { opacity: 0, y: 16, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
        }
      );
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await api.post("/chat/message", {
        message: newMessage,
        language,
      });
      // The backend returns { messages: [...] }
      setMessages((prev) => [...prev, ...(res.data?.messages || [])]);
      setNewMessage("");
    } catch (err) {
      console.error("Send failed", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Parse message for code blocks (```language\ncode\n``` or ```language code ```)
  const parseMessage = (text) => {
    if (!text) return [{ type: "text", content: "" }];

    // More flexible regex: handles optional language, optional newline after opening
    const codeBlockRegex = /```(\w+)?\s*\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textPart = text.substring(lastIndex, match.index);
        if (textPart.trim()) {
          parts.push({ type: "text", content: textPart });
        }
      }

      // Add code block
      const language = match[1] || "javascript";
      const code = match[2].trim();
      if (code) {
        parts.push({ type: "code", language, code });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textPart = text.substring(lastIndex);
      if (textPart.trim()) {
        parts.push({ type: "text", content: textPart });
      }
    }

    // If no code blocks found, return the whole text as a single part
    if (parts.length === 0) {
      parts.push({ type: "text", content: text });
    }

    return parts;
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top row: language selector */}
      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-4 py-3 shadow-inner shadow-emerald-950/30">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-300">Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="en">English</option>
            <optgroup label="Indian Languages">
              <option value="hi">Hindi - हिंदी</option>
              <option value="bn">Bengali - বাংলা</option>
              <option value="te">Telugu - తెలుగు</option>
              <option value="mr">Marathi - मराठी</option>
              <option value="ta">Tamil - தமிழ்</option>
              <option value="gu">Gujarati - ગુજરાતી</option>
              <option value="kn">Kannada - ಕನ್ನಡ</option>
              <option value="ml">Malayalam - മലയാളം</option>
              <option value="pa">Punjabi - ਪੰਜਾਬੀ</option>
              <option value="ur">Urdu - اردو</option>
            </optgroup>
            <optgroup label="World Languages">
              <option value="es">Spanish - Español</option>
              <option value="fr">French - Français</option>
              <option value="de">German - Deutsch</option>
              <option value="zh">Chinese - 中文</option>
              <option value="ja">Japanese - 日本語</option>
              <option value="ko">Korean - 한국어</option>
              <option value="ar">Arabic - العربية</option>
              <option value="pt">Portuguese - Português</option>
              <option value="ru">Russian - Русский</option>
            </optgroup>
          </select>
        </div>
        <div className="text-xs text-slate-400">
          Smooth, GSAP-powered interactions ✨
        </div>
      </div>

      {/* Middle row: messages area */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-slate-950/40 px-3 py-4 shadow-inner shadow-black/40"
      >
        {error && (
          <p className="mb-2 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        )}
        {messages.length === 0 && !error && (
          <p className="text-sm text-slate-500 text-center">
            Start the conversation by sending a message.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m._id}
              data-message-id={m._id}
              className={`flex ${
                m.sender === "bot" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`relative max-w-2xl rounded-2xl px-4 py-3 text-sm shadow-lg ${
                  m.sender === "bot"
                    ? "bg-slate-800/90 text-slate-100"
                    : "bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950"
                }`}
              >
                <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-200/70">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      m.sender === "bot" ? "bg-cyan-300" : "bg-emerald-900"
                    }`}
                  />
                  {m.sender === "bot" ? "Bot" : "You"} • {m.language}
                </div>
                <div className="leading-relaxed break-words">
                  {parseMessage(m.message).map((part, idx) => {
                    if (part.type === "code") {
                      return (
                        <CodeBlock
                          key={idx}
                          code={part.code}
                          language={part.language}
                        />
                      );
                    }
                    return (
                      <p key={idx} className="whitespace-pre-wrap">
                        {part.content}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/70 px-3 py-3 shadow-inner shadow-emerald-950/30"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/40 transition hover:translate-y-[-1px] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
