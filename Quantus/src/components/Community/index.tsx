import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown, MessageCircle, Shield, AlertTriangle, Users, Send } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';

interface CommentData {
    id: string;
    author: string;
    tier: Tier;
    body: string;
    upvotes: number;
    downvotes: number;
    anchor: string;
    createdAt: string;
    voted?: 'up' | 'down' | null;
}

interface CommunityThreadProps {
    reportId: string;
    anchor: string;        // 'A' | 'B' | 'C' | 'D' | 'E' | 'deep_dive:7'
    anchorLabel: string;        // human-readable
    userTier: Tier;
    registeredUsers: number;
    lightMode?: boolean;
}

// ─── Threshold ───────────────────────────────────────────────────────────────

const UNLOCK_THRESHOLD = 500;

// ─── Mock comments ────────────────────────────────────────────────────────────

const MOCK_COMMENTS: CommentData[] = [
    {
        id: '1', author: 'J. Harrington', tier: 'INSTITUTIONAL', anchor: 'A',
        body: 'The STRONG BUY aligns with our internal positioning — momentum and regime signals confirm. SHAP weights suggest macro context may be slightly overstated relative to HF signal.',
        upvotes: 18, downvotes: 1, createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    },
    {
        id: '2', author: 'research_desk_42', tier: 'UNLOCKED', anchor: 'A',
        body: 'RSI: 67.3 is approaching overbought — I disagree this warrants STRONG BUY without waiting for a pullback. Confidence feels generous at 82%.',
        upvotes: 9, downvotes: 4, createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    },
    {
        id: '3', author: 'fund_mgr_L', tier: 'INSTITUTIONAL', anchor: 'A',
        body: 'Sentiment composite confirms. Grok volume 23% above 90d average is an organic signal not a pump — we checked raw tweet timing distribution.',
        upvotes: 11, downvotes: 0, createdAt: new Date(Date.now() - 7 * 3600_000).toISOString(),
    },
];

// ─── Tier badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: Tier }) {
    const styles: Record<Tier, { bg: string; color: string; label: string }> = {
        INSTITUTIONAL: { bg: 'rgba(99,102,241,0.15)', color: '#818CF8', label: '🏛 Institutional' },
        UNLOCKED: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: '✓ Unlocked' },
        FREE: { bg: 'rgba(107,114,128,0.1)', color: '#9CA3AF', label: 'Free' },
    };
    const s = styles[tier];
    return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
            {s.label}
        </span>
    );
}

// ─── Single comment ───────────────────────────────────────────────────────────

function CommentCard({
    comment, userTier, onVote, lightMode,
}: {
    comment: CommentData; userTier: Tier; onVote: (id: string, dir: 'up' | 'down') => void; lightMode?: boolean;
}) {
    const cardBg = lightMode ? 'rgba(255,255,255,0.9)' : '#0A0A0A';
    const border = lightMode ? '#E2E8F0' : '#1A1A1A';
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';

    const elapsed = useMemo(() => {
        const h = (Date.now() - new Date(comment.createdAt).getTime()) / 3_600_000;
        if (h < 1) return `${Math.round(h * 60)}m ago`;
        return `${Math.round(h)}h ago`;
    }, [comment.createdAt]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4"
            style={{ background: cardBg, border: `1px solid ${border}` }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-semibold text-sm" style={{ color: tp }}>{comment.author}</span>
                <TierBadge tier={comment.tier} />
                <span className="text-xs ml-auto text-gray-500">{elapsed}</span>
            </div>

            {/* Body */}
            <p className="text-sm leading-relaxed mb-3" style={{ color: ts }}>{comment.body}</p>

            {/* Vote row */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => userTier !== 'FREE' && onVote(comment.id, 'up')}
                    disabled={userTier === 'FREE'}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-40 hover:scale-105"
                    style={{
                        background: comment.voted === 'up' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${comment.voted === 'up' ? 'rgba(16,185,129,0.4)' : border}`,
                        color: comment.voted === 'up' ? '#10B981' : ts,
                    }}
                >
                    <ThumbsUp className="w-3 h-3" />{comment.upvotes}
                </button>
                <button
                    onClick={() => userTier !== 'FREE' && onVote(comment.id, 'down')}
                    disabled={userTier === 'FREE'}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-40 hover:scale-105"
                    style={{
                        background: comment.voted === 'down' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${comment.voted === 'down' ? 'rgba(239,68,68,0.3)' : border}`,
                        color: comment.voted === 'down' ? '#EF4444' : ts,
                    }}
                >
                    <ThumbsDown className="w-3 h-3" />{comment.downvotes}
                </button>
                {userTier === 'FREE' && (
                    <span className="text-xs text-gray-500">Sign up to vote</span>
                )}
            </div>
        </motion.div>
    );
}

// ─── Community Thread ─────────────────────────────────────────────────────────

export function CommunityThread({
    reportId: _reportId, anchor, anchorLabel, userTier, registeredUsers, lightMode,
}: CommunityThreadProps) {
    const [comments, setComments] = useState<CommentData[]>(
        MOCK_COMMENTS.filter(c => c.anchor === anchor.replace('SECTION_', '')),
    );
    const [draft, setDraft] = useState('');
    const [posting, setPosting] = useState(false);

    // Community hidden until threshold
    if (registeredUsers < UNLOCK_THRESHOLD) {
        return (
            <div
                className="rounded-xl p-6 text-center"
                style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
                <Users className="w-6 h-6 mx-auto mb-3 text-indigo-400" />
                <p className="font-semibold text-sm mb-1" style={{ color: '#F9FAFB' }}>Community opens at launch milestone</p>
                <p className="text-xs text-gray-500">
                    {registeredUsers.toLocaleString()} / {UNLOCK_THRESHOLD.toLocaleString()} members — Community activates when we reach {UNLOCK_THRESHOLD.toLocaleString()} researchers.
                </p>
                <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (registeredUsers / UNLOCK_THRESHOLD) * 100)}%`, background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }} />
                </div>
            </div>
        );
    }

    const handleVote = (id: string, dir: 'up' | 'down') => {
        setComments(cs => cs.map(c => c.id !== id ? c : {
            ...c,
            upvotes: dir === 'up' ? c.upvotes + 1 : c.upvotes,
            downvotes: dir === 'down' ? c.downvotes + 1 : c.downvotes,
            voted: dir,
        }));
    };

    const handlePost = async () => {
        if (!draft.trim() || userTier === 'FREE') return;
        setPosting(true);
        await new Promise(r => setTimeout(r, 500));
        // POST /api/community/comment (production)
        const newComment: CommentData = {
            id: Date.now().toString(),
            author: 'You',
            tier: userTier,
            body: draft.trim(),
            upvotes: 0,
            downvotes: 0,
            anchor,
            createdAt: new Date().toISOString(),
        };
        setComments(cs => [newComment, ...cs]);
        setDraft('');
        setPosting(false);
    };

    const border = lightMode ? '#E2E8F0' : '#1A1A1A';

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-sm" style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                    {anchorLabel} Discussion
                </span>
                <span className="text-xs ml-2 text-gray-500">
                    {comments.length} comment{comments.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1 ml-auto text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    AI-moderated
                </div>
            </div>

            {/* Compose box */}
            <div
                className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}` }}
            >
                {userTier === 'FREE' ? (
                    <p className="text-xs text-center py-1 text-gray-500">
                        <a href="#" className="text-blue-400 hover:underline">Sign up</a> to join the discussion
                    </p>
                ) : (
                    <div className="flex gap-2">
                        <textarea
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            placeholder={`"This analysis missed X because…" — anchor your comment to ${anchorLabel}`}
                            rows={2}
                            className="flex-1 bg-transparent text-sm resize-none focus:outline-none"
                            style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}
                        />
                        <button
                            onClick={handlePost}
                            disabled={!draft.trim() || posting}
                            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-105 disabled:opacity-40 self-end"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' }}
                        >
                            <Send className="w-3.5 h-3.5" />
                            {posting ? 'Posting…' : 'Post'}
                        </button>
                    </div>
                )}
            </div>

            {/* Community vs Quantus divergence notice */}
            {comments.filter(c => c.body.toLowerCase().includes('disagree')).length >= 2 && (
                <div className="flex items-start gap-2 text-xs p-3 rounded-xl"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">
                        <span className="text-amber-400 font-semibold">Community divergence detected</span> — A portion of analysts disagree with this signal. Quantus confidence score adjusted accordingly. See Section A.
                    </span>
                </div>
            )}

            {/* Comment list */}
            <div className="space-y-3">
                <AnimatePresence>
                    {comments.map(c => (
                        <CommentCard
                            key={c.id}
                            comment={c}
                            userTier={userTier}
                            onVote={handleVote}
                            lightMode={lightMode}
                        />
                    ))}
                </AnimatePresence>
                {comments.length === 0 && (
                    <p className="text-center text-sm py-4 text-gray-500">
                        No comments yet. Be the first to contribute analysis.
                    </p>
                )}
            </div>
        </section>
    );
}
