import { useEffect, useState } from "react"
import Calendar from "react-calendar"
import { getUserStats, getLogsByDate } from "../services/api"
import {
  Activity,
  TrendingUp,
  Dumbbell,
  Apple,
  CalendarIcon,
  User,
  Target,
  Clock,
  ChevronRight,
  BarChart3,
} from "lucide-react"


import "./calendar-styles.css"

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [logs, setLogs] = useState({ meals: [], workouts: [] })
  const [calendarHighlights, setCalendarHighlights] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const userData = await getUserStats()
        setStats(userData.data)
      } catch (err) {
        console.error("Failed to fetch user stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const res = await getLogsByDate()
        setCalendarHighlights(res.data)
      } catch (err) {
        console.error("Failed to fetch calendar highlights:", err)
      }
    }
    fetchHighlights()
  }, [])

  useEffect(() => {
    async function fetchLogs() {
      try {
        const isoDate = selectedDate.toISOString().split("T")[0]
        const response = await getLogsByDate(isoDate)
        setLogs(response.data)
      } catch (err) {
        console.error("Failed to fetch logs:", err)
      }
    }
    fetchLogs()
  }, [selectedDate])

  // Calculate completion percentage for progress bars
  const workoutCompletionPercentage = stats ? Math.min((stats.past30Workouts / 30) * 100, 100) : 0
  const mealCompletionPercentage = stats ? Math.min((stats.past30Meals / 90) * 100, 100) : 0 // Assuming 3 meals per day

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-300">Track your fitness journey and daily progress</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
            <CalendarIcon className="w-5 h-5 text-cyan-400 mr-2" />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* User Profile Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{stats.name}</h2>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-slate-300">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Age</span>
                        </div>
                        <span className="font-medium text-white">{stats.age} years</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-slate-300">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span>Height</span>
                        </div>
                        <span className="font-medium text-white">{stats.height} in</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-slate-300">
                          <Activity className="w-4 h-4 mr-2" />
                          <span>Weight</span>
                        </div>
                        <span className="font-medium text-white">{stats.weight} lbs</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-slate-300">
                          <Target className="w-4 h-4 mr-2" />
                          <span>Goal</span>
                        </div>
                        <span className="font-medium text-white capitalize">{stats.goal}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Summary Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
                      Last 30 Days Activity
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-2 text-emerald-400" />
                            <span className="text-slate-300">Workouts</span>
                          </div>
                          <span className="text-white font-medium">{stats.past30Workouts} / 30</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                            style={{ width: `${workoutCompletionPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Apple className="w-4 h-4 mr-2 text-cyan-400" />
                            <span className="text-slate-300">Meals</span>
                          </div>
                          <span className="text-white font-medium">{stats.past30Meals} / 90</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${mealCompletionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-slate-300 mb-1">Avg. Workouts</p>
                          <p className="text-xl font-bold text-white">
                            {(stats.past30Workouts / 4).toFixed(1)}
                            <span className="text-xs text-slate-400 font-normal">/week</span>
                          </p>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-slate-300 mb-1">Avg. Meals</p>
                          <p className="text-xl font-bold text-white">
                            {(stats.past30Meals / 30).toFixed(1)}
                            <span className="text-xs text-slate-400 font-normal">/day</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-cyan-400" />
                      Activity Calendar
                    </h3>

                    <div className="calendar-container">
                      <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        className="gymbro-calendar"
                        tileContent={({ date }) => {
                          const key = date.toISOString().split("T")[0]
                          const hasMeals = calendarHighlights[key]?.meals
                          const hasWorkouts = calendarHighlights[key]?.workouts

                          return (
                            <div className="flex justify-center space-x-1 mt-1">
                              {hasMeals && (
                                <div className="w-2 h-2 rounded-full bg-cyan-500" title="Meals logged"></div>
                              )}
                              {hasWorkouts && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500" title="Workouts logged"></div>
                              )}
                            </div>
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Logs Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                  Activity for{" "}
                  {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meals Log */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <Apple className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-md font-semibold text-white">Meals</h4>
                    </div>

                    {logs.meals.length > 0 ? (
                      <div className="space-y-3">
                        {logs.meals.map((meal, i) => (
                          <div
                            key={i}
                            className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 hover:border-cyan-500/50 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="font-medium text-white capitalize">{meal.category}</h5>
                              <span className="text-xs text-slate-400">{meal.time || "No time recorded"}</span>
                            </div>
                            <p className="text-slate-300 text-sm">{meal.items.join(", ")}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-center">
                        <p className="text-slate-400">No meals logged for this day</p>
                        <button className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 flex items-center justify-center mx-auto">
                          Log a meal <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Workouts Log */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                        <Dumbbell className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-md font-semibold text-white">Workouts</h4>
                    </div>

                    {logs.workouts.length > 0 ? (
                      <div className="space-y-3">
                        {logs.workouts.map((workout, i) => (
                          <div
                            key={i}
                            className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 hover:border-emerald-500/50 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="font-medium text-white">{workout.name}</h5>
                              {workout.duration && (
                                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                                  {workout.duration} min
                                </span>
                              )}
                            </div>
                            {workout.sets && (
                              <p className="text-slate-300 text-sm">
                                {workout.sets} sets × {workout.reps} reps
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-center">
                        <p className="text-slate-400">No workouts logged for this day</p>
                        <button className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 flex items-center justify-center mx-auto">
                          Log a workout <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}