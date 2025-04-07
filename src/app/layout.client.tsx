'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Client Components
import { ToastProvider } from '@/context/ToastContext';
import { useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

function NetworkErrorListener() {
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      showToast(event.detail.message, event.detail.type);
    };

    window.addEventListener('showNotification', handleNotification as EventListener);
    return () => {
      window.removeEventListener('showNotification', handleNotification as EventListener);
    };
  }, [showToast]);


  useEffect(() => {
    const handleForbiddenPush = (event: CustomEvent) => {
      router.push(event.detail.path);
    };

    window.addEventListener('forbiddenPush', handleForbiddenPush as EventListener);
  }, []);

  
  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ToastProvider>
          <NetworkErrorListener />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
