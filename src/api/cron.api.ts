// src/api/cron.api.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008';
const API = `${API_URL}/admin/cron`;

export interface CronConfig {
  queueCron: string;
  processorCron: string;
  channelMinIntervalMinutes: number;
  maxSendAttempts: number;
}

export const getCronConfig = () => axios.get<CronConfig>(API);

export const updateAllCron = (config: Partial<CronConfig>) =>
  axios.post<CronConfig>(API, config);

export const updateQueueCron = (cron: string) =>
  axios.post<CronConfig>(`${API}/queue`, { cron });

export const updateProcessorCron = (cron: string) =>
  axios.post<CronConfig>(`${API}/processor`, { cron });

export const updateInterval = (minutes: number) =>
  axios.post<CronConfig>(`${API}/interval`, { minutes });

export const updateAttempts = (attempts: number) =>
  axios.post<CronConfig>(`${API}/attempts`, { attempts });