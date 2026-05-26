import ChatBox from "../components/ChatBox";
import Dashboard from "../components/Dashboard";

function ChatPage() {

  return (
    <div className="flex h-screen min-w-0 bg-slate-100">

      <ChatBox />
      <div className="hidden w-[420px] shrink-0 border-l border-slate-200 bg-slate-50 xl:block">
        <Dashboard />
      </div>

    </div>
  );
}

export default ChatPage;
