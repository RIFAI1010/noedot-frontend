"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Menu, Bell, Search } from "lucide-react"
import { FaBarsProgress } from "react-icons/fa6";

interface NavbarProps {
    onMenuClick: () => void
    sidebarOpen: boolean
}

const Navbar = ({ sidebarOpen, onMenuClick }: NavbarProps) => {

    const pathname = usePathname();

    return (
        // <nav className="text-white py-3 px-6 flex justify-between items-center fixed top-0 right-0 left-68 bg-zinc-800 z-40">
        //     <div className="font-bold text-lg">MyApp</div>
        //     <BsThreeDots className="text-zinc-300 cursor-pointer" />
        // </nav>
        <header className="fixed top-0 left-0 right-0 h-12 border-b border-zinc-700 bg-zinc-800 z-30 flex items-center px-4">
            <div className="flex items-center w-full gap-4">
                {/* <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button> */}
                <div className="p-4">
                    <button onClick={onMenuClick} >
                        <FaBarsProgress className={`text-2xl cursor-pointer transition-all duration-600 ${sidebarOpen ? "text-zinc-300" : "text-zinc-500"}`} />
                    </button>
                </div>

                <div className="font-bold text-lg">
                <Link href="/" title="dashboard">
                    {/* <img src="/next.svg" alt="logo" width={88} className="dark:invert cursor-pointer" /> */}
                    <svg height="88" width="88" xmlns="http://www.w3.org/2000/svg">
                        <image height="88" width="88" className="dark:invert cursor-pointer" href="/next.svg" />
                    </svg>
                </Link>
                </div>

                <div className="flex-1 flex items-center justify-end md:justify-between">

                    <div className="flex items-center gap-4">
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
