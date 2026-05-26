import { useEffect } from "react";

import useChatStore from "../store/chatStore";

import {
  getConversations,
  getConversationMessages
} from "../api/chatApi.js";

export default function Sidebar() {

  const {
    conversations,
    setConversations,
    setConversationId,
    setMessages
  } = useChatStore();

  useEffect(() => {

    loadConversations();

  }, []);


  const loadConversations =
    async () => {

      const data =
        await getConversations();

      setConversations(data);
    };


  const openConversation =
    async (id) => {

      const messages =
        await getConversationMessages(id);

      setConversationId(id);

      setMessages(messages);
    };

  return (
    <div className="w-80 border-r h-screen overflow-y-auto">

      <div className="p-4 font-bold text-lg">
        Conversations
      </div>

      {
        conversations.map((c) => (

          <div
            key={c.id}
            onClick={() =>
              openConversation(c.id)
            }
            className="p-4 border-b cursor-pointer hover:bg-gray-100"
          >
            {c.title || "New Chat"}
          </div>

        ))
      }
    </div>
  );
}