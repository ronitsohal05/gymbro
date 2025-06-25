import { useState, useRef, useCallback } from "react"
import { getNutritionLogs, getWorkoutLogs, agentLogMeal, agentLogWorkout, getContextFromPinecone,sessionId } from "../services/api"
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
    },
    {
      type: "function",
      name: "get_workout_logs",
      description: "In order to advice the user well nutritionally you can fetch the user's workout logs from the past 7 days in formatted text.",
      parameters: {
        type: "object",
        properties: {}
      }
    },
    {
      "type": "function",
      "name": "log_meal",
      "description": "Logs a user's meal with timestamp, meal type, and food items consumed",
      "parameters": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "format": "date-time",
            "description": "ISO 8601 timestamp string indicating when the meal was consumed"
          },
          "type": {
            "type": "string",
            "enum": ["breakfast", "lunch", "dinner", "snack", "other"],
            "description": "Type of meal being logged"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Array of food items consumed in the meal",
            "minItems": 1
          }
        },
        "required": ["date", "mealType", "filteredItems"]
      }
    },

    {
      "type": "function",
      "name": "log_meal",
      "description": "Logs a user's meal with timestamp, meal type, and food items consumed",
      "parameters": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "format": "date-time",
            "description": "ISO 8601 timestamp string indicating when the meal was consumed"
          },
          "type": {
            "type": "string",
            "enum": ["breakfast", "lunch", "dinner", "snack", "other"],
            "description": "Type of meal being logged"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Array of food items consumed in the meal",
            "minItems": 1
          }
        },
        "required": ["date", "type", "items"]
      }
    },
    {
      "type": "function",
        "name": "log_workout",
        "description": "Logs a workout session to the user's account based on what exercises they did.",
        "parameters": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string",
                    "format": "date-time",
                    "description": "The date and time the workout happened, in ISO 8601 format (e.g. 2025-06-05T17:00:00Z). The date rigt now is{current_date}."
                },
                "type": {
                    "type": "string",
                    "description": "A short description of the workout (e.g., push day, leg day, cardio)."
                },
                "activities": {
                    "type": "array",
                    "description": "List of exercises performed with details.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "Name of the exercise, e.g., push-ups"
                            },
                            "mode": {
                                "type": "string",
                                "description": "Tracking method used for the exercise.",
                                "enum": ["reps", "time"]
                            },
                            "sets": {
                                "type": "integer",
                                "description": "Number of sets (if mode is 'reps')"
                            },
                            "reps": {
                                "type": "integer",
                                "description": "Number of reps per set (if mode is 'reps')"
                            },
                            "duration": {
                                "type": "number",
                                "description": "Duration in minutes (if mode is 'time')"
                            }
                        },
                        "required": ["name", "mode"],
                    }
                },
                "notes": {
                    "type": "string",
                    "description": "Optional notes about the workout"
                }
            },
            "required": ["date", "activities", "type"],
        },
    },
    {
      type: "function",
      name: "search_knowledge_base",
      description: "Searches the nutrition and fitness knowledge base using semantic similarity to provide some context while providing answers. Can be used with user logs to provide the best advice.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The user's question or search query"
          }
        },
        required: ["query"]
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
    }, 
    get_workout_logs: async () => {
      try {
        const response = await getWorkoutLogs();
        console.log(response);
      

        return {
          result: response.data.log
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    },
    log_meal: async (args) => {
      try {
        const { date, type, items } = JSON.parse(args);
        
        const payload = {
          date,
          type,
          items
        };
        
        const response = await agentLogMeal(payload);
        console.log(response);
        
        return {
          result: response.data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    },
    log_workout: async (args) => {
      try {
        const { date, type, activities, notes} = JSON.parse(args);
        const payload = {
          date,
          type,
          activities,
          notes: notes || ""
        };
        
        const response = await agentLogWorkout(payload);
        console.log(response);
        
        return {
          result: response.data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    },
    search_knowledge_base: async (args) => {
      try {
        const { query } = JSON.parse(args);

        const response = await getContextFromPinecone({ query });
        console.log(response);

        return {
          result: response.data.results  
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
      </div>
    </div>
  );
}