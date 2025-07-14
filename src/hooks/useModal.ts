import { useState, useCallback } from 'react';

export const useModal = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);
    const [shouldRender, setShouldRender] = useState(initialState);
    const [show, setShow] = useState(initialState);

    const openModal = useCallback(() => {
        setIsOpen(true);
        setShouldRender(true);
        const timer = setTimeout(() => {
            setShow(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const closeModal = useCallback(() => {
        setShow(false);
        const timer = setTimeout(() => {
            setShouldRender(false);
            setIsOpen(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const toggleModal = useCallback(() => {
        if (isOpen) {
            closeModal();
        } else {
            openModal();
        }
    }, [isOpen, openModal, closeModal]);

    return {
        isOpen,
        shouldRender,
        show,
        openModal,
        closeModal,
        toggleModal
    };
}; 