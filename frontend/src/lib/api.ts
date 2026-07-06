import axios, { AxiosError } from 'axios';

const USE_NODE = process.env.NEXT_PUBLIC_USE_NODE === 'true';

const api = axios.create({
    baseURL: USE_NODE 
        ? (process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:4000/api')
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/backend/api'),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('invoiceos-logout', { 
                    detail: { reason: 'session_expired' } 
                }));
            }
        }
        if (error.response?.status === 429) {
            console.error('Rate limited. Please try again later.');
        }
        if (error.response?.status && error.response.status >= 500) {
            console.error('Server error. Our team has been notified.');
        }
        return Promise.reject(error);
    }
);

export default api;
