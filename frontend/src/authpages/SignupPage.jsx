import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { signup } from "../services/api"
import { Dumbbell, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState("")
  const [height, setHeight] = useState("")
  const [age, setAge] = useState("")
  const [goal, setGoal] = useState("")
  const [weight, setWeight] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signup(username, password, firstName, lastName, gender, age, weight, height, goal)
      navigate("/login")
    } catch (err) {
      const msg = err.response?.data?.error || "Signup failed. Please try a different username."
      setError(msg)
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="w-full py-6 flex justify-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">GymBro</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
                <p className="text-slate-300">Join GymBro and start your fitness journey today</p>
              </div>

              {/* Progress Steps */}
              <div className="mt-6 flex justify-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-300"}`}
                  >
                    1
                  </div>
                  <div className={`w-16 h-1 ${step > 1 ? "bg-cyan-500" : "bg-slate-700"}`}></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-300"}`}
                  >
                    2
                  </div>
                  <div className={`w-16 h-1 ${step > 2 ? "bg-cyan-500" : "bg-slate-700"}`}></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-300"}`}
                  >
                    3
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8">
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-white">Account Information</h3>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Choose a username"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Create a secure password"
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center px-6 py-3 border border-transparent rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg shadow-cyan-500/25 transition-all duration-150"
                      >
                        Next <ChevronRight className="ml-2 w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-white">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-1">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Your first name"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-1">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-1">
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          required
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          <option value="" disabled>
                            Select gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-1">
                          Age
                        </label>
                        <input
                          id="age"
                          name="age"
                          type="number"
                          required
                          min="1"
                          max="120"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Your age"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-150"
                      >
                        <ChevronLeft className="mr-2 w-5 h-5" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center px-6 py-3 border border-transparent rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg shadow-cyan-500/25 transition-all duration-150"
                      >
                        Next <ChevronRight className="ml-2 w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-white">Fitness Profile</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-1">
                          Height (cm)
                        </label>
                        <input
                          id="height"
                          name="height"
                          type="number"
                          required
                          min="50"
                          max="250"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Your height in cm"
                        />
                      </div>

                      <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-slate-300 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          id="weight"
                          name="weight"
                          type="number"
                          required
                          min="20"
                          max="300"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Your weight in kg"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="goal" className="block text-sm font-medium text-slate-300 mb-1">
                        Fitness Goal
                      </label>
                      <select
                        id="goal"
                        name="goal"
                        required
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="" disabled>
                          Select your primary goal
                        </option>
                        <option value="weight_loss">Weight Loss</option>
                        <option value="muscle_gain">Muscle Gain</option>
                        <option value="strength">Strength Training</option>
                        <option value="endurance">Endurance</option>
                        <option value="general_fitness">General Fitness</option>
                      </select>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-150"
                      >
                        <ChevronLeft className="mr-2 w-5 h-5" /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center px-6 py-3 border border-transparent rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg shadow-cyan-500/25 transition-all duration-150 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            Creating Account...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <UserPlus className="w-5 h-5 mr-2" />
                            Create Account
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-sm text-slate-500">
        <p>&copy; 2024 GymBro. All rights reserved.</p>
      </div>
    </div>
  )
}
