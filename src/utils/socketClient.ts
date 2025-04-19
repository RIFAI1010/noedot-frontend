import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './config';

let socket: Socket | null = null;
let isRefreshing = false;

const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const getUserPayload = () => {
    try {
        const token = getAccessToken();
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

const refreshAccessToken = async (): Promise<string | null> => {
    if (isRefreshing) return null;
    isRefreshing = true;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getRefreshToken()}`
            }
        });

        if (!res.ok) throw new Error('Refresh failed');

        const data = await res.json();
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
    } catch (err) {
        console.error('Token refresh failed', err);
        return null;
    } finally {
        isRefreshing = false;
    }
};

export const connectSocket = async (): Promise<Socket | null> => {
    const token = getAccessToken();
    if (!token) return null;

    if (socket?.connected) return socket;

    socket = io(API_BASE_URL, {
        auth: { token },
        autoConnect: false,
    });

    socket.connect();

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket?.id);
    });

    socket.on('error', async (err: any) => {
        console.error('Socket error:', err);
        if (err?.code === 401 || err?.message === 'Unauthorized') {
            const newToken = await refreshAccessToken();
            if (newToken) {
                console.log('Retrying socket connection with new token...');
                socket?.disconnect();
                socket?.off(); // bersihkan event listener
                socket = null;
                await connectSocket(); // konek ulang
            }
        }
        if (err?.code === 403 || err?.message === 'Forbidden') {
            const event = new CustomEvent('forbiddenPush', {
                detail: {
                    path: '/',
                    message: 'Forbidden'
                }
            });
            window.dispatchEvent(event);
        }
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.emit('leaveUser');
        socket.off('joinedUser');
        socket.disconnect();
        socket = null;
        console.log('Socket cleaned up');
    }
};

export const getSocket = () => socket;
