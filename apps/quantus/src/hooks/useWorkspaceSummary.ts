import { useEffect, useState } from 'react';
import { fetchWorkspaceSummary } from '../services/workspace';
import type { WorkspaceSummary } from '../types';

export function useWorkspaceSummary() {
    const [workspaceSummary, setWorkspaceSummary] = useState<WorkspaceSummary | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        void fetchWorkspaceSummary(controller.signal)
            .then((summary) => {
                if (controller.signal.aborted) {
                    return;
                }

                setWorkspaceSummary(summary);
            })
            .catch((error) => {
                if (controller.signal.aborted) {
                    return;
                }

                console.error('Workspace summary error:', error);
            });

        return () => controller.abort();
    }, []);

    return {
        workspaceSummary,
    };
}
