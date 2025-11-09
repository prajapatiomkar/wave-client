import { apiClient } from "./api";
import type { Message } from "../types";

export const messageAPI = {
  getHistory: async (
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ messages: Message[] }> => {
    const response = await apiClient.get(`/messages/${roomId}`, {
      params: { limit, offset },
    });
    return response.data;
  },
};
