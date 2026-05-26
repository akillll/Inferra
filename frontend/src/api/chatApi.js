const API = "http://localhost:8000";

export const streamMessage = (
  conversationId,
  message,
  onConversation,
  onToken,
  onDone
) => {

  const eventSource = new EventSource(
    `${API}/chat-stream?message=${encodeURIComponent(message)}&conversation_id=${conversationId || ""}`
  );

  eventSource.onmessage = (event) => {

    if (
      event.data.startsWith(
        "__conversation__:"
      )
    ) {

      const id = event.data.replace(
        "__conversation__:",
        ""
      );

      onConversation(id);

      return;
    }

    onToken(event.data);
  };

  eventSource.onerror = () => {

    eventSource.close();

    onDone();
  };

  return eventSource;
};


export const getConversations =
  async () => {

    const response = await fetch(
      `${API}/conversations`
    );

    return response.json();
  };


export const getConversationMessages =
  async (conversationId) => {

    const response = await fetch(
      `${API}/conversation/${conversationId}`
    );

    return response.json();
  };