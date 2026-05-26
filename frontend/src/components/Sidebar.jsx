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
