import axios from 'axios';

// 🔥 URL desde .env de Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008';

const API = `${API_URL}/announcement`;

export const getAnnouncements = () => axios.get(API);

export const getAnnouncement = (id: number) =>
  axios.get(`${API}/${id}`);

export const createAnnouncement = (data: any) =>
  axios.post(API, data);

export const updateAnnouncement = (id: number, data: any) =>
  axios.patch(`${API}/${id}`, data);

export const deleteAnnouncement = (id: number) =>
  axios.delete(`${API}/${id}`);