"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ignoreCallbackUrl } from "@/utils/config";

interface GoogleLoginButtonProps {
    onSuccess?: () => void;
    login: boolean;
    setIsLoading?: (loading: boolean) => void;
}

export default function GoogleLoginButton({onSuccess, login, setIsLoading}: GoogleLoginButtonProps) {
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        if (setIsLoading) setIsLoading(true);

        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const popup = window.open(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            "google-auth",
            `width=${width},height=${height},top=${top},left=${left}`
        );

        if (!popup) {
            console.error("Popup blocked by browser");
            setGoogleLoading(false);
            if (setIsLoading) setIsLoading(false);
            return;
        }

        const checkPopup = setInterval(() => {
            if (!popup || popup.closed) {
                clearInterval(checkPopup);
                setGoogleLoading(false);
                if (setIsLoading) setIsLoading(false);
            }
        }, 500);

        window.addEventListener("message", (event) => {
            if (event.origin !== process.env.NEXT_PUBLIC_API_URL) return;

            const { token, name, avatar } = event.data;
            // console.log('event.data', event.data);
            if (token) {
                localStorage.setItem("accessToken", token);
                localStorage.setItem("name", name);
                localStorage.setItem("avatar", avatar);
                popup.close();
                if (onSuccess) onSuccess();
                if (setIsLoading) setIsLoading(false);
                const callbackUrl = new URL(window.location.href).searchParams.get('callbackUrl');
                if (callbackUrl && !ignoreCallbackUrl.includes(callbackUrl)) {
                    router.push(callbackUrl);
                } else {
                    router.push('/dashboard');
                }
            }
        });
    };

    return (
        <button
            onClick={handleGoogleLogin}
            title="Sign In with Google"
            disabled={googleLoading}
            className="relative w-full mt-4 flex items-center justify-center cursor-pointer min-h-[40px] px-4 rounded-lg border border-zinc-700 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition"
        >
            {!googleLoading ? (
                <div className="flex items-center text-center justify-center gap-2 text-white">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    <span>{login ? "Sign In" : "Sign Up"} with Google</span>
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
    );
}
