import ChatWindow from "./ChatWindow";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Main chat area */}
      <main className="flex-1 overflow-hidden p-4 bg-gray-100">
        <ChatWindow />
      </main>
    </div>
  );
}
