import { useState, useRef, useEffect } from "react";
import "./chat.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botMsg = {
        text: data.reply,
        sender: "bot",
      };

      setMessages([...newMessages, botMsg]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { text: "Error connecting to server ❌", sender: "bot" },
      ]);
    }

    setLoading(false);
  };

  const printSingleMessage = (text) => {
    const newWindow = window.open("", "", "width=600,height=400");

    newWindow.document.write(`
      <html>
        <head>
          <title>Chat Response</title>
          <style>
            body {
              font-family: Arial;
              padding: 20px;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <h3>Response:</h3>
          <p>${text}</p>
        </body>
      </html>
    `);

    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">

        {/* Messages */}
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              
              <div className="bubble">
                {msg.text}

                {msg.sender === "bot" && (
                  <button
                    className="print-btn"
                    onClick={() => printSingleMessage(msg.text)}
                  >
                    🖨️
                  </button>
                )}
              </div>

            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="message bot">
              <div className="bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>

      </div>
    </div>
  );
}

export default Chat;