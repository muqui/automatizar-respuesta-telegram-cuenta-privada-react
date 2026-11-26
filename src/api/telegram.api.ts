
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008';

const API = `${API_URL}/telegram-messages`;

// Obtener conversaciones
export const getTelegramChats = (accountId?: number) =>
  axios.get(`${API}/chats`, {
    params: accountId ? { accountId } : {},
  });

// Obtener historial de una conversación
export const getTelegramMessages = (
  chatId: number,
  accountId: number,
) =>
  axios.get(`${API}/chat`, {
    params: { chatId, accountId },
  });
