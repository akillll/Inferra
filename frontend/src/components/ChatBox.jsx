import {
  useEffect,
  useRef,
  useState
} from "react";

import useChatStore from "../store/chatStore";

import {
  cancelStream as cancelStreamRequest,
  streamMessage
} from "../api/chatApi";

const createMessageId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const streamRef = useRef(null);
  const streamIdRef = useRef(null);

  const {
    conversationId,
    setConversationId,
    messages,
    addMessage,
    appendToMessage,
    refreshConversations,
  } = useChatStore();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
      }
    };
  }, []);

  const finishStream = () => {
    if (streamRef.current) {
      streamRef.current.close();
    }

    streamRef.current = null;
    streamIdRef.current = null;
    setIsStreaming(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const message = input.trim();
    const assistantMessageId = createMessageId();

    setError("");
    setIsStreaming(true);

    addMessage({
      id: createMessageId(),
      role: "user",
      content: message,
    });

    addMessage({
      id: assistantMessageId,
      role: "assistant",
      content: "",
    });

    const stream = streamMessage(
      conversationId,

      message,

      (id) => {
        setConversationId(id);
        refreshConversations();
      },

      (streamId) => {
        streamIdRef.current = streamId;
      },

      (token) => {
        appendToMessage(assistantMessageId, token);
      },

      (message) => {
        setError(message);
        finishStream();
      },

      () => {
        finishStream();
      },
    );

    streamRef.current = stream;

    setInput("");
  };

  const cancelStream = async () => {
    if (!streamIdRef.current) {
      finishStream();
      return;
    }

    try {
      await cancelStreamRequest(streamIdRef.current);
    } catch (err) {
      setError(err.message);
    } finally {
      finishStream();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={msg.id || index} className="mb-4">
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>

      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 flex-1"
        />

        <button
          onClick={handleSend}
          disabled={isStreaming}
          className="bg-black text-white px-4 disabled:opacity-50"
        >
          {isStreaming ? "Streaming" : "Send"}
        </button>

        <button
          onClick={cancelStream}
          disabled={!isStreaming}
          className="bg-red-500 text-white px-4 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
