import { useState, useRef, useEffect } from "react";
import "./chat.css";
import resume from "../assets/resume.pdf";

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
const openResume = () => {
  window.open(resume, "_blank");
};

// ─── Bullet renderer ─────────────────────────────────────────
// Each <li> uses a two-column grid:  [dot]  [label + value]
// The label is white-space:nowrap so it NEVER wraps mid-word.
function BotMessage({ text }) {
  const lines = text
    .split(/•/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (lines.length <= 1) return <span>{text}</span>;

  return (
    <ul className="bot-bubble-list">
      {lines.map((line, i) => {
        const colonIdx = line.indexOf(":");
        const hasLabel = colonIdx !== -1 && colonIdx < 22;

        return (
          <li key={i}>
            <span className="bot-bullet-dot">▸</span>
            <span className="bot-bullet-body">
              {hasLabel ? (
                <>
                  <span className="bullet-label">{line.slice(0, colonIdx + 1)}</span>
                  <span className="bullet-value">{line.slice(colonIdx + 1).trim()}</span>
                </>
              ) : (
                <span className="bullet-value">{line}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Main ────────────────────────────────────────────────────
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg     = { text: input, sender: "user", time: getTime() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    inputRef.current?.focus();

    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages([...newMessages, { text: data.reply, sender: "bot", time: getTime() }]);
    } catch {
      setMessages([
        ...newMessages,
        { text: "Unable to reach the server.", sender: "bot", time: getTime(), isError: true },
      ]);
    }
    setLoading(false);
  };

  const printSingleMessage = (text) => {
    const win = window.open("", "", "width=640,height=520");
    const rows = text.split("•").filter(Boolean).map((l) => `<li>${l.trim()}</li>`).join("");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Response</title>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400&family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
      <style>
        body{font-family:'Sora',sans-serif;padding:48px;background:#faf8f4;color:#1a1206;line-height:1.75}
        h3{font-family:'Playfair Display',serif;font-style:italic;color:#7a4e14;margin-bottom:24px;font-size:22px}
        ul{padding-left:18px}li{margin-bottom:8px;font-weight:300}
      </style></head><body><h3>Aswin Raj K C</h3><ul>${rows}</ul></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-avatar">✦</div>
          <div className="chat-header-info">
            <div className="chat-header-name">Jar AI</div>
            <div className="chat-header-status">Personal Portfolio Assistant</div>
          </div>
       <button className="header-btn" onClick={openResume}>
          View Resume
      </button>
        </div>

        {/* Messages */}
        <div className="chat-box">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">✦</div>
              <div className="empty-state-title">Ask me about Aswin</div>
              <div className="empty-state-sub">Skills, projects, experience — I have it covered.</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {i === 0 && <div className="date-divider"><span>Today</span></div>}

              <div className={`message ${msg.sender}`}>
                <div className="msg-avatar">{msg.sender === "user" ? "◎" : "✦"}</div>
                <div>
                  <div className={`bubble${msg.isError ? " error" : ""}`}>
                    {msg.sender === "bot" ? <BotMessage text={msg.text} /> : msg.text}
                    {/* {msg.sender === "bot" && !msg.isError && (
                      <div>
                        <button className="print-btn" onClick={() => printSingleMessage(msg.text)}>
                          Save Response
                        </button>
                      </div>
                    )} */}
                  </div>
                  <div className="msg-time">{msg.time}</div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message bot">
              <div className="msg-avatar">✦</div>
              <div className="bubble typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div>
          <div className="input-area">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask something thoughtful…"
                disabled={loading}
                maxLength={2000}
              />
            </div>
            <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
          <div className="input-footer">
            <span className="input-hint">Designed & developed by Aswin</span>
            <span className="input-hint">❤️</span>
          </div>
        </div>

      </div>
    </div>
  );
}