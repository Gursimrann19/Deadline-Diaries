import axios from 'axios';
import.meta.env.VITE_API_URL

const api = axios.create({ 
    baseURL: `${import.meta.env.VITE_API_URL}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
