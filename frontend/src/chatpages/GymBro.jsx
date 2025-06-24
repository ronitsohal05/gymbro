import { useState, useRef, useCallback } from "react"
import { getNutritionLogs, sessionId } from "../services/api"
import { Mic, MicOff } from "lucide-react"

export default function RealtimeTemplate() {
  const [status, setStatus] = useState("Click to start conversation")
  const [conversationHistory, setConversationHistory] = useState([])

  const audioRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const dataChannelRef = useRef(null);
  
  // Define your custom functions here
  const customFunctions = [
    // Add your function definitions here
    // Example:
    // {
    //   type: "function",
    //   name: "example_function",
    //   description: "Description of what this function does",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       param1: {
    //         type: "string",
    //         description: "Description of parameter"
    //       }
    //     },
    //     required: ["param1"]
    //   }
    // }
    {
      type: "function",
      name: "get_nutrition_logs",
      description: "In order to advice the user well nutritionally you can fetch the user's nutrition logs from the past 7 days in formatted text.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  ];

  // Function implementations
  const functionImplementations = {
    // Add your function implementations here
    // example_function: async (args) => {
    //   const { param1 } = JSON.parse(args);
    //   // Your function logic here
    //   return { result: "success" };
    // }
    get_nutrition_logs: async () => {
      try {
        const response = await getNutritionLogs();
        console.log(response);
      

        return {
          result: response.data.log
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    }
  };

  const handleServerEvent = useCallback(async (event) => {
    const serverEvent = JSON.parse(event.data);
    //console.log("Server event:", serverEvent);

    // Handle function calls
    if (serverEvent.type === "response.done" && serverEvent.response.output) {
      for (const output of serverEvent.response.output) {
        if (output.type === "function_call") {
          console.log("Function call detected:", output.name, output.arguments);
          
          try {
            // Execute the function
            const functionImpl = functionImplementations[output.name];
            if (functionImpl) {
              const result = await functionImpl(output.arguments);
              
              // Send function result back to the model
              const functionResultEvent = {
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: output.call_id,
                  output: JSON.stringify(result)
                }
              };

              dataChannelRef.current.send(JSON.stringify(functionResultEvent));

              // Request a new response with the function result
              const responseEvent = {
                type: "response.create"
              };

              dataChannelRef.current.send(JSON.stringify(responseEvent));
            }
          } catch (error) {
            console.error("Error executing function:", error);
            
            // Send error back to model
            const errorEvent = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: output.call_id,
                output: JSON.stringify({
                  error: "Function execution failed",
                  details: error.message
                })
              }
            };

            dataChannelRef.current.send(JSON.stringify(errorEvent));
          }
        }
      }
    }

    // Track conversation history
    if (serverEvent.type === "conversation.item.created") {
      setConversationHistory(prev => [...prev, serverEvent.item]);
    }
  }, []);

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

    const dc = pc.createDataChannel("oapi-events");
    dataChannelRef.current = dc;
    
    dc.addEventListener("open", () => {
      console.log("Data channel opened");
      
      // Configure session with functions
      const sessionUpdateEvent = {
        type: "session.update",
        session: {
          instructions: `You are a helpful AI assistant. Use the available functions when appropriate to assist the user.`,
          tools: customFunctions,
          tool_choice: "auto",
          modalities: ["text", "audio"]
        }
      };

      dc.send(JSON.stringify(sessionUpdateEvent));
    });

    dc.addEventListener("message", handleServerEvent);

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

    dataChannelRef.current = null;
    setStatus("Conversation ended");
    setConversationHistory([]);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <audio ref={audioRef} autoPlay hidden />
      
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Realtime AI Assistant</h1>
        
        {/* Status */}
        <div className="text-center mb-6">
          <p className="text-lg">{status}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {(status === "Click to start conversation" || status === "Conversation ended") && (
            <button
              onClick={init}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Conversation
            </button>
          )}

          {status === "Conversation started!" && (
            <button
              onClick={endConversation}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <MicOff className="w-4 h-4" />
              End Conversation
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-slate-800 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Template Ready:</h3>
          <ul className="space-y-1 text-slate-300">
            <li>• Add your custom functions to the customFunctions array</li>
            <li>• Implement your functions in the functionImplementations object</li>
            <li>• Update the session instructions as needed</li>
            <li>• The template handles WebRTC connection and function calling automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}