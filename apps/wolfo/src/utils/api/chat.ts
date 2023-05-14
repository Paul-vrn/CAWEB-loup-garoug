import { ChatRoom, Message, NewChatroom } from "types";
import api from "./api";

const chatApi = {
  getMessages: async (chatRoomId: number): Promise<Message[]> => {
    const { data } = await api.get(`/chatrooms/${chatRoomId}/messages`);
    return data;
  },
  getHistory: async (chatRoomId: number): Promise<Message[]> => {
    const { data } = await api.get(`/chatrooms/${chatRoomId}/history`);
    return data;
  },
  getChatrooms: async (): Promise<ChatRoom[]> => {
    const { data } = await api.get("/chatrooms");
    return data;
  },
  createChatroom: async (chatroom: NewChatroom): Promise<ChatRoom> => {
    const { data } = await api.post("/chatrooms", chatroom);
    return data;
  },

  addDeadToChatroom: async (
    chatRoomId: number,
    userDeadId: string,
    gameId: number
  ): Promise<void> => {
    const response = await api.post(`/chatrooms/${chatRoomId}/adduserdead`, { userDeadId, gameId });

    if (response.status !== 200) {
      throw new Error("Failed to add dead to spirit");
    }
  },

  postMessage: async (
    chatRoomId: string,
    content: string,
    authorId: string,
    gameId: number
  ): Promise<void> => {
    const response = await api.post(`/chatrooms/${chatRoomId}/messages`, {
      content,
      authorId,
      gameId,
    });

    if (response.status === 201) {
      throw new Error("Failed to send message");
    }
  },
  getPermissions: async (chatRoomId: number): Promise<{ write: boolean; read: boolean }> => {
    const { data } = await api.get(`/chatrooms/${chatRoomId}/permissions`);
    return data;
  },
};

export const {
  getMessages,
  getHistory,
  createChatroom,
  getChatrooms,
  postMessage,
  getPermissions,
  addDeadToChatroom,
} = chatApi;
