"use client";

import Link from "next/link";
// import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);


    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
        } catch (error) {
            console.error("Google login error:", error);
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRegisterLoading(true);
        try {
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-800">
            <div className="flex flex-col items-center w-full max-w-md gap-6">
                {/* Logo */}
                <div className="w-42 absolute top-20">
                    <img src="/next.svg" alt="Logo" className="w-full dark:invert" />
                </div>

                {/* Form Container */}
                <div className="w-full bg-zinc-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl mb-3 font-bold text-center text-white">Register</h2>

                    {/* Form Login */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-white">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-800"
                                    placeholder="Enter your name"
                                    value={name}
                                    name="name"
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-800"
                                    placeholder="Enter your email"
                                    value={email}
                                    name="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-800"
                                    placeholder="Enter your password"
                                    value={password}
                                    name="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={registerLoading}
                            className="w-full cursor-pointer min-h-[40px] bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-zinc-800 transition"
                        >
                            {registerLoading ? (
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
                            ) : "Register"}
                        </button>

                    </form>
                    {/* Garis Pembatas */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-zinc-900 px-2 text-white">OR</span>
                        </div>
                    </div>

                    {/* Login dengan OAuth */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="relative w-full mt-4 flex items-center justify-center cursor-pointer min-h-[40px] px-4 rounded-lg border border-zinc-700 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:cursor-not-allowed transition"
                    >
                        {!googleLoading ? (
                            <div className="flex items-center text-center justify-center gap-2 text-white">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>
                                <span>Sign in with Google</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-center justify-center gap-2 text-white">
                                <svg
                                    aria-hidden="true"
                                    className="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
                        )}
                    </button>

                    <p className="mt-4 text-center text-sm text-white">
                        Already have an account?{" "}
                        <Link href="/login" className="text-zinc-500 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

