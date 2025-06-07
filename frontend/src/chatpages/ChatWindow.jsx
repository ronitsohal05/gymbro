import { useState, useRef, useEffect } from "react";
import { chat } from "../services/api"; 
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatWindow() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hey there! I'm your AI trainer. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up SpeechRecognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening((prev) => !prev);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await chat(trimmed);
      const reply = res.data.reply || "Sorry, no reply.";

      if (res.data.audio_base64) {
        const audioData = res.data.audio_base64;
        const byteCharacters = atob(audioData);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        const audioBlob = new Blob([byteArray], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
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
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-lg">
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
            onClick={toggleListening}
            className={`px-4 py-2 rounded-lg font-medium ${
              isListening ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {isListening ? "Stop" : "🎤 Speak"}
          </button>
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
