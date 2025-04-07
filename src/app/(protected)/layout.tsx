'use client'

import ProtectedLayout from '@/app/(protected)/components/ProtectedLayout'
import Sidebar from '@/app/(protected)/components/sidebar'
import Navbar from '@/app/(protected)/components/Navbar'
import { useEffect, useState } from 'react'

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