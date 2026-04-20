import axios from 'axios';

const API = 'http://161.97.98.135:3001/announcement';

export const getAnnouncements = () => axios.get(API);

export const getAnnouncement = (id: number) =>
  axios.get(`${API}/${id}`);

export const createAnnouncement = (data: any) =>
  axios.post(API, data);

export const updateAnnouncement = (id: number, data: any) =>
  axios.patch(`${API}/${id}`, data);

export const deleteAnnouncement = (id: number) =>
  axios.delete(`${API}/${id}`);