import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./authpages/SignupPage";
import LoginPage from "./authpages/LoginPage";
import ChatPage from "./chatpages/ChatPage";
import LogWorkoutPage from "./logpages/LogWorkoutPage";
import LogMealPage from "./logpages/LogMealPage";
import DashboardPage from "./userpages/DashboardPage";
import Navbar from "./Navbar";
import LandingPage from "./LandingPage";
import { AuthContext } from "./contexts/AuthContext";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/log-workout"
          element={isAuthenticated ? <LogWorkoutPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/log-meal"
          element={isAuthenticated ? <LogMealPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen">
              <h2 className="text-2xl">404: Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
