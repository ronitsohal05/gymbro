import { logout } from "../services/api";
import ChatWindow from "./ChatWindow";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header bar with a Logout button */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">GymBro</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main chat area */}
      <main className="flex-1 overflow-hidden p-4 bg-gray-100">
        <ChatWindow />
      </main>
    </div>
  );
}
