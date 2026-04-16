import { useCallback, useEffect, useRef, useState } from 'react';
import {
    addWatchlistAsset,
    fetchUserWatchlist,
    removeWatchlistAsset,
} from '../services/product';
import type { AssetEntry } from '../types';
import {
    PINNED_ASSETS_STORAGE_KEY,
    RECENT_ASSETS_STORAGE_KEY,
    buildAssetEntryFromWatchlistItem,
    readStoredAssets,
    upsertAsset,
    writeStoredAssets,
} from '../utils/workspaceState';

interface UseWorkspaceAssetsOptions {
    userId?: string | null;
}

export function useWorkspaceAssets({ userId }: UseWorkspaceAssetsOptions) {
    const [recentAssets, setRecentAssets] = useState<AssetEntry[]>(() => readStoredAssets(RECENT_ASSETS_STORAGE_KEY));
    const [pinnedAssets, setPinnedAssets] = useState<AssetEntry[]>(() => readStoredAssets(PINNED_ASSETS_STORAGE_KEY));
    const previousUserIdRef = useRef(userId ?? null);
    const pinnedAssetsRef = useRef(pinnedAssets);

    useEffect(() => {
        writeStoredAssets(RECENT_ASSETS_STORAGE_KEY, recentAssets);
    }, [recentAssets]);

    useEffect(() => {
        writeStoredAssets(PINNED_ASSETS_STORAGE_KEY, pinnedAssets);
    }, [pinnedAssets]);

    useEffect(() => {
        pinnedAssetsRef.current = pinnedAssets;
    }, [pinnedAssets]);

    useEffect(() => {
        const nextUserId = userId ?? null;
        if (previousUserIdRef.current === nextUserId) {
            return;
        }

        previousUserIdRef.current = nextUserId;
        if (!nextUserId) {
            setPinnedAssets([]);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            return;
        }

        const controller = new AbortController();
        void fetchUserWatchlist(controller.signal)
            .then((data) => {
                if (controller.signal.aborted) {
                    return;
                }

                setPinnedAssets((data.items ?? []).map((item) => buildAssetEntryFromWatchlistItem(item)));
            })
            .catch((error) => {
                if (controller.signal.aborted) {
                    return;
                }

                console.error('Persisted watchlist sync error:', error);
            });

        return () => controller.abort();
    }, [userId]);

    const rememberRecentAsset = useCallback((asset: AssetEntry, maxItems = 6) => {
        setRecentAssets((previous) => upsertAsset(previous, asset, maxItems));
    }, []);

    const isPinnedAsset = useCallback((ticker: string) => (
        pinnedAssets.some((entry) => entry.ticker === ticker)
    ), [pinnedAssets]);

    const togglePinnedAsset = useCallback(async (asset: AssetEntry) => {
        const previousAssets = pinnedAssetsRef.current;
        const isPinned = previousAssets.some((entry) => entry.ticker === asset.ticker);

        setPinnedAssets(
            isPinned
                ? previousAssets.filter((entry) => entry.ticker !== asset.ticker)
                : upsertAsset(previousAssets, asset, 8),
        );

        if (!userId) {
            return;
        }

        try {
            if (isPinned) {
                await removeWatchlistAsset(asset.ticker);
            } else {
                await addWatchlistAsset(asset.ticker, asset.assetClass);
            }
        } catch (error) {
            console.error('Pinned asset sync error:', error);
            setPinnedAssets(previousAssets);
        }
    }, [userId]);

    return {
        isPinnedAsset,
        pinnedAssets,
        recentAssets,
        rememberRecentAsset,
        togglePinnedAsset,
    };
}
