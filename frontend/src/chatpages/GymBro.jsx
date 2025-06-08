import { useState, useRef, useEffect } from "react"
import { chat } from "../services/api"
import { Mic, MicOff, Volume2 } from "lucide-react"

export default function Gymbro() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentMessage, setCurrentMessage] = useState("")
  const [lastResponse, setLastResponse] = useState("Hello! I'm your AI fitness coach. Tap the center to start talking.")
  const [transcript, setTranscript] = useState("")

  const recognitionRef = useRef(null)
  const audioRef = useRef(null)

  // Set up SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("Speech Recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = (event) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      if (finalTranscript) {
        setCurrentMessage(finalTranscript)
        sendMessage(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
      setIsProcessing(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (!isProcessing) {
        setTranscript("")
      }
    }

    recognitionRef.current = recognition
  }, [])

  const sendMessage = async (message) => {
    if (!message.trim()) return

    setIsProcessing(true)
    setIsListening(false)

    try {
      const res = await chat(message)
      const reply = res.data.reply || "Sorry, I didn't understand that."

      setLastResponse(reply)
      setCurrentMessage("")
      setTranscript("")

      // Play audio response if available
      if (res.data.audio_base64) {
        setIsSpeaking(true)
        const audioData = res.data.audio_base64
        const byteCharacters = atob(audioData)
        const byteArray = new Uint8Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i)
        }
        const audioBlob = new Blob([byteArray], { type: "audio/mpeg" })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }

        audio.play()
        audioRef.current = audio
      } else {
        setIsSpeaking(false)
      }
    } catch (err) {
      console.error(err)
      setLastResponse("Something went wrong. Please try again.")
      setIsSpeaking(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else if (!isProcessing && !isSpeaking) {
      recognitionRef.current.start()
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsSpeaking(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
        {/* Status Display */}
        <div className="mb-8 text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            {isListening ? "Listening..." : isProcessing ? "Processing..." : isSpeaking ? "Speaking..." : "Ready"}
          </h2>

          {/* Current transcript or last response */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
            <p className="text-slate-300 text-lg leading-relaxed text-center">
              {transcript || currentMessage || lastResponse}
            </p>
          </div>
        </div>

        {/* Central Jarvis Interface */}
        <div className="relative mb-8">
          {/* Outer Ring */}
          <div
            className={`w-80 h-80 rounded-full border-2 transition-all duration-300 ${
              isListening
                ? "border-red-500 shadow-lg shadow-red-500/50 animate-pulse"
                : isProcessing
                  ? "border-yellow-500 shadow-lg shadow-yellow-500/50 animate-spin"
                  : isSpeaking
                    ? "border-green-500 shadow-lg shadow-green-500/50 animate-pulse"
                    : "border-cyan-500 shadow-lg shadow-cyan-500/50"
            } flex items-center justify-center`}
          >
            {/* Inner Circle */}
            <button
              onClick={isSpeaking ? stopSpeaking : toggleListening}
              disabled={isProcessing}
              className={`w-64 h-64 rounded-full transition-all duration-300 flex items-center justify-center ${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : isProcessing
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 cursor-not-allowed"
                    : isSpeaking
                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              } shadow-2xl transform hover:scale-105 active:scale-95`}
            >
              {isListening ? (
                <MicOff className="w-16 h-16 text-white" />
              ) : isProcessing ? (
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isSpeaking ? (
                <Volume2 className="w-16 h-16 text-white animate-pulse" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </button>
          </div>

          {/* Pulse Effect */}
          {(isListening || isSpeaking) && (
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500 animate-ping opacity-20"></div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center max-w-md">
          <p className="text-slate-400 mb-2">
            {isListening
              ? "Speak now... Tap again to stop"
              : isProcessing
                ? "Processing your request..."
                : isSpeaking
                  ? "Tap to stop speaking"
                  : "Tap the center to start voice conversation"}
          </p>
          <p className="text-slate-500 text-sm">Ask me about workouts, nutrition, or any fitness questions</p>
        </div>
      </div>

      {/* Audio Visualizer Effect */}
      {(isListening || isSpeaking) && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-cyan-500 rounded-full animate-pulse ${isListening ? "h-8" : "h-4"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}