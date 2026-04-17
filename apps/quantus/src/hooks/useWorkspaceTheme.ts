import { useCallback, useEffect, useState } from 'react';
import { persistLightMode, readStoredLightMode } from '../utils/workspaceState';

export function useWorkspaceTheme() {
    const [lightMode, setLightMode] = useState<boolean>(() => readStoredLightMode());

    useEffect(() => {
        persistLightMode(lightMode);
    }, [lightMode]);

    const toggleLightMode = useCallback(() => {
        setLightMode((value) => !value);
    }, []);

    return {
        lightMode,
        toggleLightMode,
    };
}
