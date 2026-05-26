import { useState } from "react";

import useChatStore from "../store/chatStore";

import { streamMessage } from "../api/chatApi";

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
    });

    addMessage({
      role: "assistant",
      content: "",
    });

    const assistantIndex = messages.length + 1;

    const stream = streamMessage(
      conversationId,

      input,

      (id) => {
        setConversationId(id);
      },

      (token) => {
        useChatStore.setState((state) => {
          const updated = [...state.messages];

          updated[assistantIndex].content += token;

          return {
            messages: updated,
          };
        });
      },

      () => {
        console.log("stream complete");
      },
    );

    window.currentStream = stream;

    setInput("");
  };

  const cancelStream = async () => {
    if (window.currentStream) {
      window.currentStream.close();
    }

    await fetch(`http://localhost:8000/cancel/${conversationId}`, {
      method: "POST",
    });
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4">
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 flex-1"
        />

        <button onClick={handleSend} className="bg-black text-white px-4">
          Send
        </button>

        <button onClick={cancelStream} className="bg-red-500 text-white px-4">
          Cancel
        </button>
      </div>
    </div>
  );
}
