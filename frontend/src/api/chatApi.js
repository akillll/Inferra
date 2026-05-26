const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const streamMessage = (
  conversationId,
  message,
  onConversation,
  onStream,
  onToken,
  onError,
  onDone
) => {

  const eventSource = new EventSource(
    `${API}/chat-stream?message=${encodeURIComponent(message)}&conversation_id=${conversationId || ""}`
  );

  eventSource.addEventListener("stream", (event) => {
    const payload = JSON.parse(event.data);

    onStream(payload.stream_id);
  });

  eventSource.addEventListener("conversation", (event) => {
    const payload = JSON.parse(event.data);

    onConversation(payload.conversation_id);
  });

  eventSource.addEventListener("token", (event) => {
    const payload = JSON.parse(event.data);

    onToken(payload.value);
  });

  eventSource.addEventListener("done", () => {
    eventSource.close();

    onDone();
  });

  eventSource.addEventListener("stream-error", (event) => {
    const payload = JSON.parse(event.data);

    onError(payload.message);

    eventSource.close();
  });

  eventSource.onerror = () => {

    eventSource.close();

    onError("Stream connection failed");
  };

  return eventSource;
};


export const getConversations =
  async () => {

    const response = await fetch(
      `${API}/conversations`
    );

    if (!response.ok) {
      throw new Error("Failed to load conversations");
    }

    return response.json();
  };


export const getConversationMessages =
  async (conversationId) => {

    const response = await fetch(
      `${API}/conversation/${conversationId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load conversation messages");
    }

    return response.json();
  };


export const cancelStream =
  async (streamId) => {

    const response = await fetch(
      `${API}/cancel/${streamId}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to cancel stream");
    }

    return response.json();
  };
