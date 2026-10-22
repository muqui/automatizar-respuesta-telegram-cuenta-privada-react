// src/api/channel.api.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008';
const API = `${API_URL}/channels`;

export interface ChannelFilters {
  isActive?: boolean;
  accountId?: number;
}

export interface ChannelPayload {
  name: string;
  telegramId: string;
  isActive?: boolean;
  accountId?: number;
}

export const getChannels = (filters: ChannelFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.isActive !== undefined)
    params.append('isActive', String(filters.isActive));
  if (filters.accountId)
    params.append('accountId', String(filters.accountId));
  const query = params.toString();
  return axios.get(`${API}${query ? `?${query}` : ''}`);
};

export const getChannelsStats = () => axios.get(`${API}/stats`);
export const getChannel = (id: number) => axios.get(`${API}/${id}`);
export const toggleChannel = (id: number) =>
  axios.patch(`${API}/${id}/toggle`);
export const createChannel = (data: ChannelPayload) =>
  axios.post(API, data);
export const updateChannel = (id: number, data: Partial<ChannelPayload>) =>
  axios.patch(`${API}/${id}`, data);
export const deleteChannel = (id: number) =>
  axios.delete(`${API}/${id}`);