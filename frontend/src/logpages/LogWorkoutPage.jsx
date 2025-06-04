import { useState } from "react";
import { logWorkout }  from "../services/api.js";

export default function LogWorkoutPage() {
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await logWorkout()
      setMessage("Workout logged!");
      setType("");
      setDuration("");
      setNotes("");
    } catch (err) {
        console.log(err);
      setMessage("Failed to log workout.");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Log a Workout</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-4">
          <span>Workout Type</span>
          <input
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          <span>Duration (minutes)</span>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          <span>Notes (optional)</span>
          <textarea
            className="w-full border p-2 rounded"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Log Workout
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
      </form>
    </div>
  );
}
