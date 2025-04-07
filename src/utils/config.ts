import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3850';

export const ignoreCallbackUrl = ['/login', '/register', '/forgot-password', '/reset-password'];

// Fungsi untuk menampilkan toast error
const showNotification = (message?: string) => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('showNotification', {
            detail: {
                message: message || 'An unexpected error occurred',
                type: 'error'
            }
        });
        window.dispatchEvent(event);
    }
};

const forbiddenPush = (path: string, message: string) => {
    const event = new CustomEvent('forbiddenPush', {
        detail: {
            path: path,
            message: message,
        }
    });
    window.dispatchEvent(event);
}


export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const axiosPublic = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor untuk menambahkan token ke setiap request jika tersedia
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        if (error.code === 'ERR_NETWORK') {
            showNotification(error.message);
        }
        return Promise.reject(error);
    }
);

axiosPublic.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        if (error.code === 'ERR_NETWORK') {
            showNotification(error.message);
        }
        return Promise.reject(error);
    }
);

// Interceptor untuk menangani response
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Handle network error
        if (!error.response) {
            if (error.code === 'ERR_NETWORK') {
                showNotification(error.message);
            }
            return Promise.reject(error);
        }

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {withCredentials: true});
                const newAccessToken = refreshResponse.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('name', refreshResponse.data.name);
                localStorage.setItem('avatar', refreshResponse.data.avatar);
                axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token failed', refreshError);
                localStorage.removeItem('accessToken');
                window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                // forbiddenPush('/login?callbackUrl=' + encodeURIComponent(window.location.pathname), 'error');
                return Promise.reject(refreshError);
            }
        }
        if (error.response.status === 403) {
            window.location.href = '/';
            // forbiddenPush('/', 'error');
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

// Tambahkan interceptor untuk axiosPublic juga
axiosPublic.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            if (error.code === 'ERR_NETWORK') {
                showNotification();
            }
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);
