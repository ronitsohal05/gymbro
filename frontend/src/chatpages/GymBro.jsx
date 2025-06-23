import { useState, useRef } from "react"
import { sessionId } from "../services/api"
import { Mic, MicOff, Volume2 } from "lucide-react"

export default function Gymbro() {
  const [status, setStatus] = useState("Click to start conversation")

  const audioRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  
  async function init() {

    setStatus("Initializing...");

    const tokenResponse = await sessionId();
    const EPHEMERAL_KEY = tokenResponse.data.client_secret.value;

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    pc.ontrack = e => audioEl.srcObject = e.streams[0];

    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    streamRef.current = ms;
    pc.addTrack(ms.getTracks()[0]);

    const dc = pc.createDataChannel("oadi-events");
    dc.addEventListener("message", (e) => {
      console.log(e);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2025-06-03";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp"
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    setStatus("Conversation started!");
  }

  function endConversation() {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    setStatus("Conversation ended");
  }

  /*
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

  */

  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
      <audio ref={audioRef} autoPlay hidden />
      <h1 className="text-2xl font-bold mb-4">{status}</h1>
      {(status === "Click to start conversation" || status === "Conversation ended") && (
        <button
          onClick={init}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
        >
          Start Talking to AI
        </button>
      )}
      {status === "Conversation started!" && (
        <button
          onClick={endConversation}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          End Conversation
        </button>
      )}
    </div>
  );
}