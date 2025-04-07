"use client";

// import Google from "next-auth/providers/google";
// import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/app/(auth)/components/GoogleLoginButton";
import { axiosPublic, ignoreCallbackUrl } from "@/utils/config";

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
    const router = useRouter();
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState(false);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginLoading(true);
        setError(false);
        setMessage("");
        try {
            const response = await axiosPublic.post("/auth/login", {
                email,
                password
            })
            setError(false);
            setMessage(response.data.message);
            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("name", response.data.name);
            localStorage.setItem("avatar", response.data.avatar);
            const callbackUrl = new URL(window.location.href).searchParams.get('callbackUrl');
            if (callbackUrl && !ignoreCallbackUrl.includes(callbackUrl)) {
                router.push(callbackUrl);
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            setError(true);
            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
        } finally {
            setLoginLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setError(false);
        setForgotMessage(false);
        if (!email) {
            setError(true);
            setForgotMessage(true);
            setMessage("Please enter your email.");
            return;
        }

        setForgotLoading(true);
        setMessage("");

        try {
            const response = await axiosPublic.post("/auth/forgot-password", { email });
            setMessage(response.data.message);
        } catch (err: unknown) {
            const error = err as ApiError;
            setError(true);
            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
        } finally {
            setForgotLoading(false);
        }
    };


    return (
        <div className="w-full bg-zinc-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl mb-3 font-bold text-center text-white">Sign In</h2>

            {/* Login dengan OAuth */}
            <GoogleLoginButton login={true} setIsLoading={setGoogleAuthLoading}></GoogleLoginButton>

            {/* Garis Pembatas */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-zinc-900 px-2 text-white">OR</span>
                </div>
            </div>

            {/* Form Login */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-white">Email</label>
                    <input
                        type="email"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 bg-zinc-800 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-700 disabled:bg-zinc-700 disabled:cursor-not-allowed ${forgotMessage ? 'border-red-400' : 'border-zinc-700'}`}
                        placeholder="Enter your email"
                        value={email}
                        name="email"
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={googleAuthLoading || loginLoading}
                    />
                </div>

                <div>
                    <label className="block text-white">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 border bg-zinc-800 border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-700 disabled:bg-zinc-700 disabled:cursor-not-allowed"
                        placeholder="Enter your password"
                        value={password}
                        name="password"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={googleAuthLoading || loginLoading}
                    />
                </div>

                <div className="flex items-center justify-end">

                    <button
                        type="button"
                        title="Forgot Password"
                        onClick={handleForgotPassword}
                        className="text-zinc-500 hover:underline cursor-pointer disabled:cursor-not-allowed"
                        disabled={forgotLoading || googleAuthLoading}
                    >
                        {forgotLoading ? "Sending..." : "Forgot Password?"}
                    </button>
                </div>

                <button
                    type="submit"
                    title="Log In"
                    disabled={loginLoading || googleAuthLoading}
                    className="w-full cursor-pointer min-h-[40px] bg-zinc-600 text-white py-2 mb-2 px-4 rounded-lg hover:bg-zinc-500 disabled:bg-zinc-800 disabled:cursor-not-allowed transition"
                >
                    {loginLoading ? (
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
                    ) : "Log In"}

                </button>
                {message && <p className={`mb-0 ${error ? 'text-red-400' : 'text-green-400'} text-sm`}>{message}</p>}

            </form>

            <p className="mt-4 text-center text-sm text-white">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-zinc-500 hover:underline" title="Sign Up">
                    Sing Up
                </Link>
            </p>
        </div>
    
        
    );
}

