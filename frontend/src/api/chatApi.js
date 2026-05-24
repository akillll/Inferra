import axios from "axios";

const API = "http://localhost:8000";

export const sendMessage = async (
  conversationId, message
) => {
  const response = await axios.post(`${API}/chat`,
    {
      conversation_id: conversationId,
      message,
    }
  );

  return response.data;
}