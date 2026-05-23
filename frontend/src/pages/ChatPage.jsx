import { useChatStore } from "../store/chatStore.js";

function ChatPage() {
  const { messages } = useChatStore();

  return (
    <section id="chat" className="flex h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-950">Chat</h1>
        <p className="mt-1 text-sm text-slate-500">Inference workspace placeholder</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex h-full max-w-4xl items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <div>
            <p className="text-sm font-medium text-slate-700">Chat interface pending</p>
            <p className="mt-2 text-sm text-slate-500">
              Messages in local UI state: {messages.length}
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="h-11 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            Prompt input placeholder
          </div>
        </div>
      </footer>
    </section>
  );
}

export default ChatPage;
