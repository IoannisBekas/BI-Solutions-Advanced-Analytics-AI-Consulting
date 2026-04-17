import { useCallback, useState } from 'react';

export type AuthModalMode = 'signin' | 'signup';

export function useAuthModal() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');

    const openAuthModal = useCallback((mode: AuthModalMode = 'signin') => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setAuthModalOpen(false);
    }, []);

    return {
        authModalMode,
        authModalOpen,
        closeAuthModal,
        openAuthModal,
    };
}
