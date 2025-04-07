"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosPublic } from "@/utils/config";

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    // const [button, setButton] = useState(true);
    // const [invalidError, setInvalidError] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            // setButton(false);
            return
        }
        setToken(token);
    }, []);


    const handleResend = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('handleResend');
        setLoading(true);
        setError(false);
        setMessage("");
        if (!token) {
            setMessage("Invalid request: No token provided.");
            setError(true);
            setLoading(false);
            return;
        }

        try {
            const response = await axiosPublic.post("/auth/reset", {
                token: token,
                password
            });
            setError(false);
            setMessage(response.data.message);
            const loginResponse = await axiosPublic.post("/auth/login", {
                email: response.data.email,
                password
            })
            localStorage.setItem("accessToken", loginResponse.data.accessToken);
            localStorage.setItem("name", loginResponse.data.name);
            localStorage.setItem("avatar", loginResponse.data.avatar);
            router.push('/');
        } catch (err: unknown) {
            const error = err as ApiError;
            // console.error("Login error:", err);
            setError(true);
            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full p-6 bg-zinc-900 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-2 text-center">Change Your Password</h1>
            {token ? (
                <form className="space-y-4" onSubmit={handleResend}>
                    <div className="mb-6 space-y-4">
                        <div>
                        <label className="block text-white">New Password</label>
                        <input
                            disabled={loading}
                            type="password"
                            className="w-full px-4 py-2 border bg-zinc-800 border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-700 disabled:bg-zinc-700 disabled:cursor-not-allowed"
                            placeholder="Enter new password"
                            value={password}
                            name="password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* {button && */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 cursor-pointer min-h-[40px] bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-800 rounded-lg transition disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center text-center justify-center gap-2 text-white">
                            <svg
                                aria-hidden="true"
                                className="w-5 h-5 text-gray-600 animate-spin fill-blue-600"
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
                        </div>
                    ) : "Change Password"}
                    </button>
                {/* } */}
                    {message && <p className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
                </form>
            ) : (
                <p className="text-center text-white">No token provided.</p>
            )}

        </div>

    );
}
