import { useState, useRef, useEffect } from "react"
import { chat } from "../services/api"
import { Mic, MicOff, Send } from "lucide-react"

function ChatWindow() {
  const [messages, setMessages] = useState([{ from: "bot", text: "Hey there! I'm your AI trainer. Ask me anything!" }])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const messagesEndRef = useRef(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Set up SpeechRecognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("Speech Recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
    setIsListening((prev) => !prev)
  }

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { from: "user", text: trimmed }])
    setInput("")
    setIsLoading(true)

    try {
      const res = await chat(trimmed)
      const reply = res.data.reply || "Sorry, no reply."

      if (res.data.audio_base64) {
        const audioData = res.data.audio_base64
        const byteCharacters = atob(audioData)
        const byteArray = new Uint8Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i)
        }
        const audioBlob = new Blob([byteArray], { type: "audio/mpeg" })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
      setMessages((prev) => [...prev, { from: "bot", text: reply }])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [...prev, { from: "bot", text: "Something went wrong. Try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl m-4">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[100px]">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-lg break-words ${
                m.from === "user"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-none shadow-lg"
                  : "bg-slate-700/50 text-slate-100 rounded-bl-none border border-slate-600"
              }`}
            >

                {m.text}

            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 text-slate-300 px-4 py-3 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span>GymBro is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-700 p-4 bg-slate-800/30">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              rows={2}
              className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="Type your fitness question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            onClick={toggleListening}
            className={`p-3 rounded-lg font-medium transition-all ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-lg font-medium transition-all ${
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
