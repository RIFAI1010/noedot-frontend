"use client";

import { axiosPublic } from "@/utils/config";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // Ganti next/router ke next/navigation

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function Verification() {
    const [loading, setLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const router = useRouter(); // Jangan deklarasi ulang di dalam verify()
    const [error, setError] = useState("");

    useEffect(() => {
        if (!router) return;
        verify();
    }, [router]);

    const verify = async () => {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const token = queryParams.get("token");
            const socketToken = queryParams.get("socketToken");

            if (!token || !socketToken) {
                throw new Error("Verification link is invalid.");
            }

            await axiosPublic.post("/auth/verify", {
                token,
                socketToken
            });

            setIsVerified(true);
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Login error:", err);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Verification link is invalid.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            // Simulasi request ke API backend untuk mengirim ulang email verifikasi
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (err: unknown) {
            const error = err as ApiError;
            // console.error("Error resending verification email:", error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full p-6 bg-zinc-900 rounded-lg shadow-lg text-center">
            <div className="mb-4">
                <h1 className="text-2xl font-bold mb-2">
                    {isVerified ? "Verification Successful" : "Verifying Account"}
                </h1>
                <p className="mb-2 text-zinc-300">
                    {error ? error : (isVerified
                        ? "Your account has been successfully verified. You can refresh the page or log in now."
                        : "We're currently verifying your account. Please wait a moment...")}
                </p>
            </div>

            <button
                onClick={handleResend}
                disabled={loading}
                className="w-full py-2 px-4 cursor-pointer min-h-[40px] bg-zinc-500 hover:bg-zinc-600 disabled:bg-zinc-800 rounded-lg transition"
            >
                {loading ? (<div className="flex items-center text-center justify-center gap-2 text-white">
                    <svg
                        aria-hidden="true"
                        className="w-5 h-5 text-gray-200 animate-spin fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                        />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                        />
                    </svg>
                </div>) : "Log In"}
            </button>
        </div>
    );
}

