import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function responseData(response) {
  let data = response?.data;
  if (data && Object.prototype.hasOwnProperty.call(data, 'data')) data = data.data;
  if (data && Object.prototype.hasOwnProperty.call(data, 'data')) data = data.data;
  return data;
}

export default api;
