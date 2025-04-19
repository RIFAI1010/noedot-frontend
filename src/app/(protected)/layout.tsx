'use client'

import ProtectedLayout from '@/app/(protected)/components/ProtectedLayout'
import Sidebar from '@/app/(protected)/components/sidebar'
import Navbar from '@/app/(protected)/components/Navbar'
import { useEffect, useState } from 'react'
import { getUserPayload } from '@/utils/auth'
import { io } from 'socket.io-client'
import { API_BASE_URL } from '@/utils/config'
import { disconnectSocket } from '@/utils/socketClient'
import { connectSocket } from '@/utils/socketClient'

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    const [closeByOutside, setCloseByOutside] = useState(false)
    // Check if we're on mobile and close sidebar by default
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        // Initial check
        checkScreenSize()

        // Add event listener for window resize
        window.addEventListener("resize", checkScreenSize)

        // Clean up
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    // Close sidebar by default on mobile
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false)
        } else {
            setSidebarOpen(true)
        }
    }, [isMobile])

    

    // useEffect(() => {
    //     const payload = getUserPayload();

    //     if (payload) {
    //         console.log('socket layout')
    //         socketManager.connect('/user');
    //         socketManager.emit('joinUser', { userId: payload.id }, '/user');
    //         socketManager.on('error', (error) => {
    //             console.error('Error:', error.message);
    //         });
    //         socketManager.on('joinedUser', (data) => {
    //             console.log('Berhasil bergabung ke user:', data);
    //         });
    //     }
    // }, [])

    // useEffect(() => {
    //     const payload = getUserPayload();
    //     if (payload) {
    //         console.log('Connecting user socket...');

    //         socketManager.connect('/user');
    //         socketManager.emit('joinUser', { userId: payload.id }, '/user');

    //         socketManager.on('joinedUser', (data) => {
    //             console.log('Joined user channel:', data);
    //         }, '/user');

    //         socketManager.on('error', (err) => {
    //             console.error('Socket user error:', err);
    //         }, '/user');
    //     }

    //     return () => {
    //         socketManager.disconnect('/user');
    //     };
    // }, []);

    return (
        <ProtectedLayout>
            <div className="min-h-screen bg-background">
                {/* Sidebar */}
                <Navbar sidebarOpen={sidebarOpen} onMenuClick={() => {
                    // if (!closeByOutside) {
                    setSidebarOpen(!sidebarOpen)
                    // } else {
                    //     setCloseByOutside(false)
                    // }
                }} />

                <div className="flex pt-12">
                    {/* Navbar */}
                    <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

                    {/* Konten Halaman */}
                    <main className={`flex-1 transition-all duration-600 ease-in-out ${sidebarOpen ? "md:ml-68" : "ml-0"}`}>{children}</main>
                </div>
            </div>
            {/* <div className='w-full h-full bg-red-500 flex justify-center items-center'>
                {sidebarOpen ? 'sidebarOpen' : 'sidebarClosed'}
            </div> */}
        </ProtectedLayout>
    )
}