import { Link, useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "./contexts/AuthContext"
import { removeLastMessageID, logout } from "./services/api"
import { Dumbbell } from "lucide-react"

export default function AuthenticatedNavbar() {
  const { setAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await removeLastMessageID()
    setAuthenticated(false)
    logout()
    navigate("/login")
  }

  return (
    <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div className="text-lg font-bold text-white">GymBro</div>
        </Link>
        <div className="space-x-4">
          <Link to="/dashboard" className="text-slate-300 hover:text-cyan-400 transition-colors">
            Dashboard
          </Link>
          <Link to="/chat" className="text-slate-300 hover:text-cyan-400 transition-colors">
            Chat
          </Link>
          <Link to="/log-workout" className="text-slate-300 hover:text-cyan-400 transition-colors">
            Log Workout
          </Link>
          <Link to="/log-meal" className="text-slate-300 hover:text-cyan-400 transition-colors">
            Log Meal
          </Link>
          <button onClick={handleLogout} className="text-slate-300 hover:text-cyan-400 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
