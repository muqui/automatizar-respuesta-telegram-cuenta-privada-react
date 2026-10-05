import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008';
const API = `${API_URL}/template`;

export const getTemplates = () => axios.get(API);