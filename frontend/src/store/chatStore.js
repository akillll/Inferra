import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
}));
