import { useState } from "react"
import { logWorkout } from "../services/api.js"
import {
  Dumbbell,
  Heart,
  Zap,
  StretchVerticalIcon as Stretch,
  Target,
  Shuffle,
  MoreHorizontal,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Timer,
  Hash,
  FileText,
  Activity,
} from "lucide-react"

export default function LogWorkoutPage() {
  const [type, setType] = useState("Strength")
  const [exercises, setExercises] = useState([{ name: "", mode: "duration", duration: "", sets: "", reps: "" }])
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")
  const [isLoading, setIsLoading] = useState(false)

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises]
    updated[index][field] = value
    setExercises(updated)
  }

  const addExercise = () => {
    setExercises([...exercises, { name: "", mode: "duration", duration: "", sets: "", reps: "" }])
  }

  const removeExercise = (index) => {
    if (exercises.length > 1) {
      const updated = exercises.filter((_, i) => i !== index)
      setExercises(updated)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const timestamp = new Date().toISOString()
    const cleanExercises = exercises.filter((e) => e.name.trim() !== "")

    if (!cleanExercises.length) {
      setMessage("Please add at least one exercise.")
      setMessageType("error")
      setIsLoading(false)
      return
    }

    try {
      await logWorkout({ date: timestamp, type, activities: cleanExercises, notes })
      setMessage("Workout logged successfully!")
      setMessageType("success")
      setType("Strength")
      setExercises([{ name: "", mode: "duration", duration: "", sets: "", reps: "" }])
      setNotes("")
    } catch (err) {
      console.error(err)
      setMessage("Failed to log workout. Please try again.")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const getWorkoutIcon = (workoutType) => {
    switch (workoutType) {
      case "Strength":
        return <Dumbbell className="w-5 h-5" />
      case "Cardio":
        return <Heart className="w-5 h-5" />
      case "HIIT":
        return <Zap className="w-5 h-5" />
      case "Mobility":
        return <Stretch className="w-5 h-5" />
      case "Weightlifting":
        return <Target className="w-5 h-5" />
      case "Mixed":
        return <Shuffle className="w-5 h-5" />
      default:
        return <MoreHorizontal className="w-5 h-5" />
    }
  }

  const getWorkoutTypeColor = (workoutType) => {
    switch (workoutType) {
      case "Strength":
        return "from-red-500 to-orange-500"
      case "Cardio":
        return "from-pink-500 to-rose-500"
      case "HIIT":
        return "from-yellow-500 to-amber-500"
      case "Mobility":
        return "from-green-500 to-emerald-500"
      case "Weightlifting":
        return "from-blue-500 to-indigo-500"
      case "Mixed":
        return "from-purple-500 to-violet-500"
      default:
        return "from-slate-500 to-gray-500"
    }
  }

  const workoutTypes = ["Strength", "Cardio", "HIIT", "Mobility", "Weightlifting", "Mixed", "Other"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Log Your Workout</h1>
          <p className="text-slate-300">Track your exercises and build your fitness journey</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Workout Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                <Activity className="w-4 h-4 inline mr-2" />
                Workout Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {workoutTypes.map((workoutType) => (
                  <button
                    key={workoutType}
                    type="button"
                    onClick={() => setType(workoutType)}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      type === workoutType
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          type === workoutType ? `bg-gradient-to-r ${getWorkoutTypeColor(workoutType)}` : "bg-slate-600"
                        }`}
                      >
                        {getWorkoutIcon(workoutType)}
                      </div>
                      <span className="text-xs font-medium text-white text-center">{workoutType}</span>
                    </div>
                    {type === workoutType && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                <Target className="w-4 h-4 inline mr-2" />
                Exercises
              </label>
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/30 border border-slate-600 rounded-lg p-6 hover:border-slate-500 transition-colors"
                  >
                    {/* Exercise Name */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Exercise name (e.g., Push-ups, Bench Press, Running)"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                        required
                      />
                    </div>

                    {/* Mode Selection */}
                    <div className="mb-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleExerciseChange(index, "mode", "duration")}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                            exercise.mode === "duration"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Timer className="w-4 h-4" />
                            <span className="text-sm font-medium">Timed</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExerciseChange(index, "mode", "reps")}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                            exercise.mode === "reps"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Hash className="w-4 h-4" />
                            <span className="text-sm font-medium">Sets & Reps</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Input Fields Based on Mode */}
                    {exercise.mode === "duration" ? (
                      <div className="mb-4">
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="number"
                            placeholder="Duration in minutes"
                            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                            value={exercise.duration}
                            onChange={(e) => handleExerciseChange(index, "duration", e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="number"
                            placeholder="Sets"
                            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                            value={exercise.sets}
                            onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                            min="1"
                          />
                        </div>
                        <div className="relative">
                          <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="number"
                            placeholder="Reps"
                            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Remove Exercise Button */}
                    {exercises.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Exercise
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Exercise Button */}
              <button
                type="button"
                onClick={addExercise}
                className="mt-4 flex items-center text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                <div className="w-8 h-8 border-2 border-dashed border-emerald-400 rounded-lg flex items-center justify-center mr-3 group-hover:border-emerald-300 group-hover:bg-emerald-500/10 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                Add another exercise
              </button>
            </div>

            {/* Notes Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <FileText className="w-4 h-4 inline mr-2" />
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
                rows="4"
                placeholder="How did the workout feel? Any observations or achievements?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg shadow-lg shadow-emerald-500/25 transition-all duration-150 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging Workout...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Log Workout
                  </>
                )}
              </button>

              {/* Message Display */}
              {message && (
                <div
                  className={`p-4 rounded-lg border flex items-center ${
                    messageType === "success"
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                      : "bg-red-500/10 border-red-500/50 text-red-400"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  )}
                  <span>{message}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Dumbbell className="w-5 h-5 mr-2 text-emerald-400" />
            Workout Logging Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Log workouts immediately after completion for accuracy</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Include warm-up and cool-down exercises</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Note any modifications or variations you made</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Track your progress with consistent exercise names</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
