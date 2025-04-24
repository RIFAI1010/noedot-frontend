import { useEffect, useRef, useState } from 'react';
import { BsXLg } from 'react-icons/bs';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    className?: string;
}

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children,
    showCloseButton = true,
    className = ''
}: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                setShow(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${show ? "opacity-100" : "opacity-0"}`}>
            <div 
                ref={modalRef} 
                className={`bg-zinc-900 p-6 rounded-lg border border-zinc-700 transition-all duration-300 transform ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"} ${className}`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    {showCloseButton && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white cursor-pointer"
                        >
                            <BsXLg />
                        </button>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal; 