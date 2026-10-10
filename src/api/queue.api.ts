// src/api/queue.api.ts

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3008";
const API = `${API_URL}/announcement-queue`;

export interface QueueFilters {
  isSent?: boolean;
  channelId?: number;
  announcementId?: number;
  limit?: number;
}

export const getQueue = (filters: QueueFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.isSent !== undefined)
    params.append("isSent", String(filters.isSent));
  if (filters.channelId)
    params.append("channelId", String(filters.channelId));
  if (filters.announcementId)
    params.append("announcementId", String(filters.announcementId));
  if (filters.limit) params.append("limit", String(filters.limit));

  const query = params.toString();
  return axios.get(`${API}${query ? `?${query}` : ""}`);
};
export const reorderQueue = (ids: number[]) =>
  axios.post(`${API}/reorder`, { ids });
// 🔥 Estos son los que faltaban
export const getQueueStats = () => axios.get(`${API}/stats`);
export const getQueueItem = (id: number) => axios.get(`${API}/${id}`);
export const deleteQueueItem = (id: number) => axios.delete(`${API}/${id}`);