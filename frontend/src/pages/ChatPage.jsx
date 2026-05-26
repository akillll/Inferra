import ChatBox from "../components/ChatBox";
import Dashboard from "../components/Dashboard";

function ChatPage() {

  return (
    <div className="flex h-screen">

      <ChatBox />
      <div className="w-[900px] border-l overflow-y-auto">
        <Dashboard />
      </div>

    </div>
  );
}

export default ChatPage;
