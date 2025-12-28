import axios from 'axios';
import toast from 'react-hot-toast';

export const SOCKET_URL = 'http://localhost:5000';

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

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            // Check if it's a ban message
            if (error.response.data.message && error.response.data.message.toLowerCase().includes('banned')) {
                toast.error("Your account has been banned.", {
                    duration: 5000,
                    icon: '🚫',
                    style: {
                        border: '1px solid #ef4444',
                        padding: '16px',
                        color: '#ef4444',
                    },
                });
                localStorage.removeItem('userInfo');
                window.location.href = '/banned';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
