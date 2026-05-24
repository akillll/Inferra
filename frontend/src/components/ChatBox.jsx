import { useState } from "react";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../api/chatApi";

export default function ChatBox() {
    const [input, setInput] = useState("");
    const {
        conversationId,
        setConversationId,
        messages,
        addMessage,
    } = useChatStore();

    const handleSend = async () => {
        if (!input.trim()) return;

        addMessage({
            role: "user",
            content: input,
        })

        const response = await sendMessage(
            conversationId, input
        )

        setConversationId(
            response.conversation_id
        );

        addMessage({
            role: "assistant",
            content: response.reply,
        })

        setInput("")
    }

    return (
    <div className="p-4">

      <div className="space-y-2 mb-4">
        {messages.map((msg, index) => (
          <div key={index}>
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          className="border p-2 flex-1"
        />

        <button
          onClick={handleSend}
          className="bg-black text-white px-4"
        >
          Send
        </button>
      </div>
    </div>
  );
}