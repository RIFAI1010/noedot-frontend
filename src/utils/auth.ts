import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    id: string;
    email: string;
    name: string;
}

export const getUserPayload = (): DecodedToken | null => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}; 