import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'error' | 'success' | 'info';
    onClose: () => void;
}

export default function Toast({ message, type = 'error', onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        const timer2 = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 5000);
        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
        };
    }, [onClose]);

    const handleClose = () => {
        setIsVisible(false);
        const timer = setTimeout(() => {
            onClose();
        }, 400);
        return () => clearTimeout(timer);
    }

    const bgColor = type === 'error' ? 'bg-red-400' : type === 'success' ? 'bg-green-400' : 'bg-blue-400';

    return (
        <div className='fixed left-1/2 -translate-x-1/2 top-4 z-50 flex justify-center'>
            <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                {/* {type === 'error' && ( */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor" onClick={handleClose}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {/* )} */}
                <span>{message}</span>
            </div>
        </div>
    );
} 