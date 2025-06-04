import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <div className="text-lg font-bold">GymBro</div>
      <div className="space-x-4">
        <Link to="/chat" className="hover:underline">
          Chat
        </Link>
        <Link to="/log-workout" className="hover:underline">
          Log Workout
        </Link>
        <Link to="/log-meal" className="hover:underline">
          Log Meal
        </Link>
        <button onClick={handleLogout} className="hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
}
