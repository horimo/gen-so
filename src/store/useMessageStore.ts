"use client";

import { create } from "zustand";

export interface Message {
  id: string;
  text: string;
  depth: number;
  timestamp: number;
  status: "pending" | "sending" | "sent" | "error";
}

interface MessageStore {
  messages: Message[];
  addMessage: (text: string, depth: number) => Message;
  updateMessageStatus: (id: string, status: Message["status"]) => void;
  clearMessages: () => void;
}

/**
 * メッセージと深度を管理するストア
 */
export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  
  addMessage: (text: string, depth: number) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      depth,
      timestamp: Date.now(),
      status: "pending",
    };
    
    set((state) => ({
      messages: [...state.messages, message],
    }));
    
    return message;
  },
  
  updateMessageStatus: (id: string, status: Message["status"]) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, status } : msg
      ),
    }));
  },
  
  clearMessages: () => {
    set({ messages: [] });
  },
}));

