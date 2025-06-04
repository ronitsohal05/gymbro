import { useState, useRef, useEffect } from "react";
import { chat } from "../services/api";        // adjust path if needed
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatWindow() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hey there! I'm your AI trainer. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await chat(trimmed);
      const reply = res.data.reply || "Sorry, no reply.";
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Something went wrong. Try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    // 1) flex-col, h-full so this fills its parent <main>
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-lg">
      {/* 2) Message list: flex-1 + min-h so it never collapses fully */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[100px]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg break-words ${
                m.from === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gray-500 italic">Bot is typing…</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* 3) Input area: a fixed bottom bar inside this container */}
      <div className="border-t border-gray-300 p-4">
        <div className="flex items-center space-x-2">
          <textarea
            rows={2}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="Type your question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              input.trim() && !isLoading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
