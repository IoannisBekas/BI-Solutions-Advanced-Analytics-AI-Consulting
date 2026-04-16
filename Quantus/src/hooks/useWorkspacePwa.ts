import { useEffect, useState } from 'react';
import { usePWA } from './usePWA';

export function useWorkspacePwa() {
    const {
        dismissBanner,
        install,
        needsRefresh,
        showInstallBanner,
        updateSW,
    } = usePWA();
    const [dismissedUpdateBanner, setDismissedUpdateBanner] = useState(false);

    useEffect(() => {
        if (needsRefresh) {
            setDismissedUpdateBanner(false);
        }
    }, [needsRefresh]);

    return {
        dismissBanner,
        dismissUpdateBanner: () => setDismissedUpdateBanner(true),
        install,
        needsRefresh: needsRefresh && !dismissedUpdateBanner,
        showInstallBanner,
        updateSW,
    };
}
