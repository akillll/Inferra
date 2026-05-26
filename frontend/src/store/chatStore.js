import { create } from "zustand";

const useChatStore = create((set) => ({

  conversationId: null,

  messages: [],

  conversations: [],

  conversationsVersion: 0,


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


  appendToMessage: (id, token) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id
          ? {
              ...message,
              content: message.content + token
            }
          : message
      ),
    })),


  setConversations: (
    conversations
  ) =>
    set({
      conversations
    }),


  refreshConversations: () =>
    set((state) => ({
      conversationsVersion:
        state.conversationsVersion + 1
    })),

}));

export default useChatStore;
