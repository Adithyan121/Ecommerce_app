import axios from 'axios';

export const SOCKET_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: '/api', // Vite proxy handles this
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // localStorage.removeItem('userInfo');
            // Start redirect to login if needed, or let component handle
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
