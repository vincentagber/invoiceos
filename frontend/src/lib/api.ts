import axios from 'axios';

const USE_NODE = process.env.NEXT_PUBLIC_USE_NODE === 'true';

const api = axios.create({
    baseURL: USE_NODE 
        ? (process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:4000/api')
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/backend/api'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        // Attempt to get the token directly from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // Add Authorization header if token exists
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

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the error is 401 Unauthorized, redirect to login
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login?error=session_expired';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
