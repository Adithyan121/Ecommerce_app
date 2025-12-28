import axios from 'axios';

export const SOCKET_URL = 'https://ecommerce-app-3c27.onrender.com';

const api = axios.create({
    baseURL: `${SOCKET_URL}/api`,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const token = JSON.parse(userInfo).token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
