import { axiosInstance } from '@/utils/config';

export interface LoginCredentials {
    email: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
    // user: {
    //     id: string;
    //     email: string;
    //     name: string;
    // };
    name: string;
    avatar: string;
}
export interface RefreshTokenResponse {
    accessToken: string;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('name', response.data.name);
        localStorage.setItem('avatar', response.data.avatar);
        return response.data;
    },

    async logout(): Promise<void> {
        try {
            await axiosInstance.post('/auth/logout');
            localStorage.removeItem('accessToken');
        } catch (error) {
            // console.log('error', error)
        }
    },

    // async refreshToken(): Promise<string | null> {
    //     try {
    //         const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh');
    //         return response.data.accessToken;
    //     } catch (error) {
    //         return null;
    //     }
    // },

    // async verifyToken(token: string): Promise<boolean> {
    //     // try {
    //     //     await api.post('/auth/verify', { token });
    //     //     return true;
    //     // } catch {
    //     //     return false;
    //     // }
    // }
}; 