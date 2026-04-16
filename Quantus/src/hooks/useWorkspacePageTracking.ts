import { useEffect } from 'react';
import type { RouteState } from '../lib/workspaceRoutes';

function getWorkspacePageTitle(route: RouteState) {
    switch (route.view) {
        case 'report':
            return `${route.ticker ?? 'Quantus'} Research Report | BI Solutions Group`;
        case 'sectors':
            return 'Quantus Sector Packs | BI Solutions Group';
        case 'watchlist':
            return 'Quantus Watchlist | BI Solutions Group';
        case 'archive':
            return 'Quantus Archive | BI Solutions Group';
        case 'accuracy':
            return 'Quantus Accuracy | BI Solutions Group';
        case 'methodology':
            return 'Quantus Methodology | BI Solutions Group';
        case 'notFound':
            return 'Quantus Not Found | BI Solutions Group';
        case 'hero':
        default:
            return 'Quantus Workspace | BI Solutions Group';
    }
}

export function useWorkspacePageTracking(route: RouteState) {
    useEffect(() => {
        const pageTitle = getWorkspacePageTitle(route);
        document.title = pageTitle;

        if (typeof window.gtag === 'function') {
            window.gtag('config', 'G-M1276CBX6M', {
                page_path: route.path,
                page_title: pageTitle,
            });
        }
    }, [route]);
}
