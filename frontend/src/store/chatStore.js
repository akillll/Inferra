import { create } from "zustand";

const useChatStore = create((set) => ({

  conversationId: null,

  messages: [],

  conversations: [],


  setConversationId: (id) =>
    set({
      conversationId: id
    }),


  setMessages: (messages) =>
    set({
      messages
    }),


  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        message
      ],
    })),


  setConversations: (
    conversations
  ) =>
    set({
      conversations
    }),

}));

export default useChatStore;