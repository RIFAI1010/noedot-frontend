'use client'

import { axiosInstance } from "@/utils/config";
import Link from "next/link";
import { useEffect } from "react";

export default function ProtectedPage() {

    useEffect(() => {
        const fetch = async () => {
            const response = await axiosInstance.get('/user')
            console.log(response)
        }
        fetch()
    }, [])

    return (
        <div className="flex w-full flex-col justify-center items-center gap-4 p-6">
            <div className="flex w-full justify-start gap-3 items-center px-10">
                <div className="w-1/4 bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-all cursor-pointer">
                    <h3 className="text-lg font-semibold mb-2">Total Pengguna</h3>
                    <p className="text-2xl font-bold">1,234</p>
                </div>

                <div className="w-1/4 bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-all cursor-pointer">
                    <h3 className="text-lg font-semibold mb-2">Total Catatan</h3>
                    <p className="text-2xl font-bold">5,678</p>
                </div>

                <div className="w-1/4 bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-all cursor-pointer">
                    <h3 className="text-lg font-semibold mb-2">Total Aktivitas</h3>
                    <p className="text-2xl font-bold">9,012</p>
                </div>

                <div className="w-1/4 bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-all cursor-pointer">
                    <h3 className="text-lg font-semibold mb-2">Total Projek</h3>
                    <p className="text-2xl font-bold">345</p>
                    <Link href="/home">
                        home
                    </Link>
                </div>

                <button className="absolute right-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all">
                    Lihat Semua
                </button>
            </div>
        </div>
    );
}

