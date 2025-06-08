import { useState } from "react"
import { logMeal } from "../services/api"
import { Apple, Coffee, Utensils, Cookie, Plus, Clock, CheckCircle, AlertCircle, ChefHat, Trash2 } from "lucide-react"

export default function LogMealPage() {
  const [mealItems, setMealItems] = useState([""])
  const [mealType, setMealType] = useState("breakfast")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messageType, setMessageType] = useState("success") // success or error

  const handleItemChange = (index, value) => {
    const updated = [...mealItems]
    updated[index] = value
    setMealItems(updated)
  }

  const addItem = () => setMealItems([...mealItems, ""])

  const removeItem = (index) => {
    if (mealItems.length > 1) {
      const updated = [...mealItems]
      updated.splice(index, 1)
      setMealItems(updated)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const timestamp = new Date().toISOString()
    const filteredItems = mealItems.filter((item) => item.trim() !== "")

    if (filteredItems.length === 0) {
      setMessage("Please add at least one meal item.")
      setMessageType("error")
      setIsLoading(false)
      return
    }

    try {
      await logMeal({
        date: timestamp,
        type: mealType,
        items: filteredItems,
      })
      setMessage("Meal logged successfully!")
      setMessageType("success")
      setMealItems([""])
      setMealType("breakfast")
    } catch (err) {
      console.error(err)
      setMessage("Failed to log meal. Please try again.")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const getMealIcon = (type) => {
    switch (type) {
      case "breakfast":
        return <Coffee className="w-5 h-5" />
      case "lunch":
        return <Utensils className="w-5 h-5" />
      case "dinner":
        return <ChefHat className="w-5 h-5" />
      case "snack":
        return <Cookie className="w-5 h-5" />
      default:
        return <Apple className="w-5 h-5" />
    }
  }

  const getMealTypeColor = (type) => {
    switch (type) {
      case "breakfast":
        return "from-yellow-500 to-orange-500"
      case "lunch":
        return "from-green-500 to-emerald-500"
      case "dinner":
        return "from-purple-500 to-indigo-500"
      case "snack":
        return "from-pink-500 to-rose-500"
      default:
        return "from-cyan-500 to-blue-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Apple className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Log Your Meal</h1>
          <p className="text-slate-300">Track what you eat to reach your nutrition goals</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Meal Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                <Clock className="w-4 h-4 inline mr-2" />
                Meal Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {["breakfast", "lunch", "dinner", "snack", "other"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      mealType === type
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          mealType === type ? `bg-gradient-to-r ${getMealTypeColor(type)}` : "bg-slate-600"
                        }`}
                      >
                        {getMealIcon(type)}
                      </div>
                      <span className="text-sm font-medium capitalize text-white">{type}</span>
                    </div>
                    {mealType === type && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Items */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                <Utensils className="w-4 h-4 inline mr-2" />
                What did you eat?
              </label>
              <div className="space-y-3">
                {mealItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                        placeholder={`Food item ${index + 1} (e.g., grilled chicken breast, brown rice)`}
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        required={index === 0}
                      />
                    </div>
                    {mealItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              <button
                type="button"
                onClick={addItem}
                className="mt-4 flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group"
              >
                <div className="w-8 h-8 border-2 border-dashed border-cyan-400 rounded-lg flex items-center justify-center mr-3 group-hover:border-cyan-300 group-hover:bg-cyan-500/10 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                Add another food item
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg shadow-lg shadow-cyan-500/25 transition-all duration-150 flex items-center justify-center"
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
                    Logging Meal...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Log Meal
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
            <Apple className="w-5 h-5 mr-2 text-cyan-400" />
            Logging Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Be specific about portions (e.g., "1 cup brown rice")</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Include cooking methods (e.g., "grilled", "steamed")</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Log meals as soon as possible for accuracy</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Don't forget beverages and condiments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}