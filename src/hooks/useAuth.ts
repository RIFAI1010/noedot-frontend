'use client'

import { create } from 'zustand'
import { authService } from '@/services/auth'


interface AuthStore {
    isAuthenticated: boolean
    isLoading: boolean
    checkAuth: () => Promise<void>
    // login: (credentials: LoginCredentials) => Promise<void>
    // logout: () => Promise<void>
}

export const useAuth = create<AuthStore>((set) => ({
    isAuthenticated: false,
    isLoading: true,

    checkAuth: async () => {
        try {
            console.log('checkAuth')
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) {
                console.log('No access token found')
                // try {
                //     // const response = await axiosInstance.post('/auth/refresh')
                //     // localStorage.setItem('accessToken', response.data.accessToken)
                //     set({ isAuthenticated: true, isLoading: false })
                // } catch (error) {
                    await authService.logout()
                    set({ isAuthenticated: false, isLoading: false })
                    // throw error
                // }
                return
            }
            // const isValid = await authService.verifyToken(accessToken)
            set({ 
                isAuthenticated: true, 
                isLoading: false
            })
        } catch (error) {
            await authService.logout()
            set({ isAuthenticated: false, isLoading: false })
            throw error
        }
    },

    // login: async (credentials: LoginCredentials) => {
    //     try {
    //         set({ isLoading: true })
    //         await authService.login(credentials)
    //         set({ isAuthenticated: true, isLoading: false })
    //     } catch (error) {
    //         set({ isAuthenticated: false, isLoading: false })
    //         throw error
    //     }
    // },

    // logout: async () => {
    //     try {
    //         await authService.logout()
    //     } finally {
    //         set({ isAuthenticated: false, isLoading: false })
    //     }
    // }
})) 