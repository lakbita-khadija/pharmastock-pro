import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharma_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 401) {
      localStorage.removeItem('pharma_token');
      localStorage.removeItem('pharma_user');
      window.location.href = '/login';
      toast.error('Session expirée. Reconnectez-vous.');
    } else if (status === 403) {
      toast.error('Accès refusé.');
    } else if (status === 422) {
      toast.error(message || 'Données invalides.');
    } else if (status >= 500) {
      toast.error('Erreur serveur. Réessayez plus tard.');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
