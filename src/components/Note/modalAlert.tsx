import { useEffect, useRef, useState } from "react";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText: string;
    cancelButtonText: string;
    confirmButtonColor: 'confirm' | 'danger' | 'warning' | 'info';
}

export const ModalAlert = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText, cancelButtonText, confirmButtonColor }: ModalProps) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
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

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleEnter = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                onConfirm();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('keydown', handleEnter);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleEnter);
        };
    }, [isOpen, onClose, onConfirm]);

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div ref={modalRef} className={`bg-zinc-900 p-6 rounded-lg w-[400px] border border-zinc-700 transition-all duration-300 transform ${showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
                <h3 className="text-xl font-semibold text-zinc-300 mb-2">{title}</h3>
                <p className="text-zinc-400 mb-4">{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 cursor-pointer"
                        onClick={onClose}
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        className={`px-4 py-2 text-white rounded cursor-pointer
                            ${confirmButtonColor === 'confirm' ? 'hover:bg-green-600' : confirmButtonColor === 'danger' ? 'hover:bg-red-600' : confirmButtonColor === 'warning' ? 'hover:bg-yellow-600' : 'hover:bg-zinc-600'}
                            ${confirmButtonColor === 'confirm' ? 'bg-green-500' : confirmButtonColor === 'danger' ? 'bg-red-500' : confirmButtonColor === 'warning' ? 'bg-yellow-500' : 'bg-zinc-500'}
                            `}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};