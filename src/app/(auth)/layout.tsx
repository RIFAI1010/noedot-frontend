import PublicRoute from "@/app/(auth)/components/PublicRoute";
import Image from "next/image";
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <PublicRoute>
            <div className="flex min-h-screen items-start justify-center bg-zinc-950">
                <div className="flex flex-col items-center w-full max-w-md">
                    {/* Logo */}
                <div className="w-42 z-10 mt-10 mb-10">
                    <Image src="/next.png" alt="Logo" className="w-full dark:invert" width={100} height={100} />
                </div>
                <div className="z-1 w-full">
                    {children}
                    </div>
                </div>
            </div>
        </PublicRoute>
    )
}