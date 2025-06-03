import ChatWindow from "./ChatWindow";

function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-2xl mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-gray-800">
            GymBro
          </h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <ChatWindow />
      </main>

      {/* Footer (optional) */}
      <footer className="bg-white">
        <div className="max-w-2xl mx-auto py-2 px-6 text-center text-gray-500 text-sm">
          © 2025 GymBro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;