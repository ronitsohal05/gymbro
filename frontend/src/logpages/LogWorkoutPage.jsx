import { useState } from "react";
import { logWorkout } from "../services/api.js";

export default function LogWorkoutPage() {
  const [type, setType] = useState("Strength");
  const [exercises, setExercises] = useState([
    { name: "", mode: "duration", duration: "", sets: "", reps: "" }
  ]);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", mode: "duration", duration: "", sets: "", reps: "" }
    ]);
  };

  const removeExercise = (index) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();

    const cleanExercises = exercises.filter(e => e.name.trim() !== "");

    if (!cleanExercises.length) {
      setMessage("Please add at least one exercise.");
      return;
    }

    try {
      await logWorkout({ date: timestamp, type, activities: cleanExercises, notes });
      setMessage("Workout logged!");
      setType("Strength");
      setExercises([{ name: "", mode: "duration", duration: "", sets: "", reps: "" }]);
      setNotes("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to log workout.");
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl mb-4 font-semibold">Log a Workout</h2>
      <form onSubmit={handleSubmit}>

        {/* Workout Type Dropdown */}
        <label className="block mb-4">
          <span className="block font-medium mb-1">Workout Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="HIIT">HIIT</option>
            <option value="Mobility">Mobility</option>
            <option value="Weightlifting">Weightlifting</option>
            <option value="Mixed">Mixed</option>
            <option value="Other">Other</option>
          </select>
        </label>

        {/* Exercises */}
        <div className="mb-4">
          <span className="block font-medium mb-2">Exercises</span>
          {exercises.map((exercise, index) => (
            <div key={index} className="border p-4 rounded mb-3 space-y-2">
              <input
                type="text"
                placeholder="Exercise Name"
                className="w-full border p-2 rounded"
                value={exercise.name}
                onChange={(e) =>
                  handleExerciseChange(index, "name", e.target.value)
                }
                required
              />

              {/* Mode Selection */}
              <select
                value={exercise.mode}
                onChange={(e) =>
                  handleExerciseChange(index, "mode", e.target.value)
                }
                className="w-full border p-2 rounded"
              >
                <option value="duration">Timed (minutes)</option>
                <option value="reps">Sets & Reps</option>
              </select>

              {exercise.mode === "duration" ? (
                <input
                  type="number"
                  placeholder="Duration (min)"
                  className="w-full border p-2 rounded"
                  value={exercise.duration}
                  onChange={(e) =>
                    handleExerciseChange(index, "duration", e.target.value)
                  }
                />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Sets"
                    className="w-1/2 border p-2 rounded"
                    value={exercise.sets}
                    onChange={(e) =>
                      handleExerciseChange(index, "sets", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    className="w-1/2 border p-2 rounded"
                    value={exercise.reps}
                    onChange={(e) =>
                      handleExerciseChange(index, "reps", e.target.value)
                    }
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => removeExercise(index)}
                className="text-red-500 font-bold mt-1"
              >
                × Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExercise}
            className="text-blue-600 hover:underline text-sm"
          >
            + Add another exercise
          </button>
        </div>

        {/* Notes */}
        <label className="block mb-4">
          <span className="block font-medium mb-1">Notes (optional)</span>
          <textarea
            className="w-full border p-2 rounded"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Log Workout
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
      </form>
    </div>
  );
}
