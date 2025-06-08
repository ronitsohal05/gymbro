import { useState } from "react"
import ChatWindow from "./ChatWindow"
import GymBro from "./GymBro"
import { MessageCircle, Mic } from "lucide-react"

export default function ChatPage() {
  const [chatMode, setChatMode] = useState("voice") // "jarvis" or "text"

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Toggle Header */}
      <div className="flex justify-center p-4 border-b border-slate-700">
        <div className="flex bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm border border-slate-700">
          <button
            onClick={() => setChatMode("voice")}
            className={`flex items-center px-4 py-2 rounded-md transition-all ${
              chatMode === "voice"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Mic className="w-4 h-4 mr-2" />
            Voice Mode
          </button>
          <button
            onClick={() => setChatMode("text")}
            className={`flex items-center px-4 py-2 rounded-md transition-all ${
              chatMode === "text"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Text Mode
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <main className="flex-1 overflow-hidden">{chatMode === "voice" ? <GymBro /> : <ChatWindow />}</main>
    </div>
  )
}