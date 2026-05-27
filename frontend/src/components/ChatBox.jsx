import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import useChatStore from "../store/chatStore";

import {
  cancelStream as cancelStreamRequest,
  streamMessage,
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
    <div className="flex h-screen min-w-0 flex-1 flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
        <div>
          <h1 className="text-base font-semibold text-slate-950">Chat</h1>
          <p className="text-xs text-slate-500">
            {conversationId
              ? "Conversation active"
              : "Start a new conversation"}
          </p>
        </div>

        <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
          {isStreaming ? "Streaming" : "Ready"}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.length === 0 && (
            <div className="flex min-h-[55vh] items-center justify-center text-center">
              <div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-lg font-semibold text-white">
                  I
                </div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Ask Inferra anything
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Send a prompt to begin streaming an inference response.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id || index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                    isUser
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <div
                    className={`mb-1 text-xs font-medium ${
                      isUser ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {isUser ? "You" : "Inferra"}
                  </div>
                  <div className="prose prose-sm max-w-none break-words prose-slate">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || (msg.role === "assistant" ? "..." : "")}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-lg border border-slate-300 bg-white p-2 shadow-sm focus-within:border-slate-500">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Message Inferra"
            className="max-h-32 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />

          <button
            onClick={handleSend}
            disabled={isStreaming}
            className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStreaming ? "Streaming" : "Send"}
          </button>

          <button
            onClick={cancelStream}
            disabled={!isStreaming}
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
