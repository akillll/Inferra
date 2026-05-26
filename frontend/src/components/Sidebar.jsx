import { useEffect } from "react";

import useChatStore from "../store/chatStore";

import {
  getConversations,
  getConversationMessages
} from "../api/chatApi.js";

export default function Sidebar() {

  const {
    conversations,
    conversationsVersion,
    setConversations,
    setConversationId,
    setMessages
  } = useChatStore();

  useEffect(() => {

    loadConversations();

  }, [conversationsVersion]);


  const loadConversations =
    async () => {

      try {
        const data =
          await getConversations();

        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };


  const openConversation =
    async (id) => {

      try {
        const messages =
          await getConversationMessages(id);

        setConversationId(id);

        setMessages(messages);
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-100">

      <div className="border-b border-slate-800 px-4 py-5">
        <div className="text-lg font-semibold tracking-normal">
          Inferra
        </div>
        <div className="mt-1 text-xs text-slate-400">
          LLM inference workspace
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Conversations
        </div>
        <div className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
          {conversations.length}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {
          conversations.length === 0 && (
            <div className="mx-2 rounded-md border border-dashed border-slate-800 px-3 py-4 text-sm text-slate-500">
              New chats will appear here.
            </div>
          )
        }

        {
          conversations.map((c) => (

            <button
              key={c.id}
              onClick={() =>
                openConversation(c.id)
              }
              className="mb-1 block w-full truncate rounded-md px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              {c.title || "New Chat"}
            </button>

          ))
        }
      </div>
    </div>
  );
}
