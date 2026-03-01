'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import {
    Shield, User, Globe, Monitor, LogOut, Clock, ChevronDown,
    ChevronRight, RefreshCw, Users, Activity, Lock, XCircle, CheckCircle,
    X, Calendar, Wifi, WifiOff, Timer
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Session {
    _id: string;
    userId: string;
    userModel: 'User' | 'Admin';
    sessionId: string;
    expiresAt: string;
    isValid: boolean;
    userAgent?: string;
    ipAddress?: string;
    lastActive: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        _id: string;
        username?: string;
        name?: string;
        email: string;
        avatarColor?: string;
        isPro?: boolean;
        badges?: string[];
        country?: string;
    };
}

interface UserGroup {
    userId: string;
    userModel: 'User' | 'Admin';
    user: Session['user'];
    sessions: Session[];
}

// ─── Presence helpers ───────────────────────────────────────────────────────
// A session must first be valid and not expired to have any presence.
// Then we look at lastActive to decide fine-grained presence state.
type PresenceStatus = 'online' | 'away' | 'offline' | 'expired' | 'revoked';

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 min
const AWAY_THRESHOLD_MS = 30 * 60 * 1000; // 30 min

function getPresence(session: Session): PresenceStatus {
    if (!session.isValid) return 'revoked';
    if (new Date(session.expiresAt) <= new Date()) return 'expired';

    const sinceActive = Date.now() - new Date(session.lastActive).getTime();
    if (sinceActive < ONLINE_THRESHOLD_MS) return 'online';
    if (sinceActive < AWAY_THRESHOLD_MS) return 'away';
    return 'offline';
}

// A session counts as "alive" (valid + not expired) regardless of lastActive
const isAlive = (s: Session) => s.isValid && new Date(s.expiresAt) > new Date();

// ─── Presence badge component ───────────────────────────────────────────────
function PresenceDot({ status }: { status: PresenceStatus }) {
    const map: Record<PresenceStatus, { dot: string; pulse: boolean; label: string }> = {
        online: { dot: 'bg-green-500', pulse: true, label: 'Online' },
        away: { dot: 'bg-yellow-400', pulse: false, label: 'Away' },
        offline: { dot: 'bg-gray-600', pulse: false, label: 'Offline' },
        expired: { dot: 'bg-gray-700', pulse: false, label: 'Expired' },
        revoked: { dot: 'bg-red-800', pulse: false, label: 'Revoked' },
    };
    const { dot, pulse, label } = map[status];
    return (
        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${status === 'online' ? 'text-green-400' :
                status === 'away' ? 'text-yellow-400' :
                    status === 'revoked' ? 'text-red-700' : 'text-gray-600'
            }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dot} ${pulse ? 'animate-pulse' : ''}`} />
            {label}
        </span>
    );
}

// ─── Misc helpers ───────────────────────────────────────────────────────────
const formatShortDate = (d: string) => new Date(d).toLocaleDateString();

const formatRelativeTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const parseUA = (ua?: string): { label: string; icon: string } => {
    if (!ua) return { label: 'Unknown Device', icon: '💻' };
    if (ua.includes('iPhone')) return { label: 'iPhone (Safari)', icon: '📱' };
    if (ua.includes('Android')) return { label: 'Android', icon: '📱' };
    if (ua.includes('Windows')) {
        if (ua.includes('Chrome')) return { label: 'Chrome · Windows', icon: '💻' };
        if (ua.includes('Firefox')) return { label: 'Firefox · Windows', icon: '💻' };
        if (ua.includes('Edge')) return { label: 'Edge · Windows', icon: '💻' };
        return { label: 'Windows', icon: '💻' };
    }
    if (ua.includes('Macintosh')) {
        if (ua.includes('Chrome')) return { label: 'Chrome · Mac', icon: '🍎' };
        if (ua.includes('Safari') && !ua.includes('Chrome')) return { label: 'Safari · Mac', icon: '🍎' };
        return { label: 'Mac', icon: '🍎' };
    }
    if (ua.includes('Linux')) return { label: 'Linux', icon: '🐧' };
    return { label: ua.split(' ')[0] || 'Unknown', icon: '💻' };
};

const getInitials = (user?: UserGroup['user'], model?: string) => {
    if (model === 'Admin') return 'AD';
    const name = user?.username || user?.name || '';
    return name.substring(0, 2).toUpperCase() || '??';
};

// Best presence across a user's sessions (online > away > offline > expired > revoked)
const PRESENCE_ORDER: PresenceStatus[] = ['online', 'away', 'offline', 'expired', 'revoked'];
function bestPresence(sessions: Session[]): PresenceStatus {
    const statuses = sessions.map(getPresence);
    for (const p of PRESENCE_ORDER) {
        if (statuses.includes(p)) return p;
    }
    return 'revoked';
}

// Auto-refresh interval — 60 s is a comfortable balance between freshness & resource use
const POLL_INTERVAL_MS = 60_000;

// ─── Session Detail Panel ───────────────────────────────────────────────────
function SessionDetailPanel({
    group,
    currentSessionId,
    onClose,
    onRevoke,
    onRevokeAll,
}: {
    group: UserGroup;
    currentSessionId: string | null;
    onClose: () => void;
    onRevoke: (id: string) => void;
    onRevokeAll: (userId: string, name: string) => void;
}) {
    const aliveSessions = group.sessions.filter(isAlive);
    const displayName = group.user?.username || group.user?.name || 'Unknown User';
    const overall = bestPresence(group.sessions);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-lg h-full bg-[#0d0f1a] border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-indigo-900/20">
                    <div className="flex items-center gap-4">
                        {/* Avatar with presence ring */}
                        <div className="relative">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg ${group.userModel === 'Admin'
                                    ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                                    : 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                                }`}>
                                {getInitials(group.user, group.userModel)}
                            </div>
                            {/* Online dot on avatar */}
                            <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0d0f1a] ${overall === 'online' ? 'bg-green-500' :
                                    overall === 'away' ? 'bg-yellow-400' :
                                        overall === 'offline' ? 'bg-gray-500' : 'bg-gray-700'
                                }`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-white">{displayName}</h2>
                                {group.userModel === 'Admin' && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px] py-0 px-1.5">ADMIN</Badge>
                                )}
                                {group.user?.isPro && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] py-0 px-1.5">PRO</Badge>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">{group.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/3 border-b border-white/10">
                    <div className="py-3 px-4 text-center">
                        <div className="text-xl font-bold text-white">{group.sessions.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total</div>
                    </div>
                    <div className="py-3 px-4 text-center">
                        <div className="text-xl font-bold text-green-400">{aliveSessions.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Valid</div>
                    </div>
                    <div className="py-3 px-4 text-center">
                        <div className="text-xl font-bold text-gray-400">{group.sessions.length - aliveSessions.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Expired</div>
                    </div>
                </div>

                {/* Revoke all */}
                {aliveSessions.length > 0 && (
                    <div className="px-6 py-3 border-b border-white/10 flex justify-end">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRevokeAll(group.userId, displayName)}
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-xs gap-2"
                        >
                            <LogOut size={13} />
                            Revoke All Valid Sessions
                        </Button>
                    </div>
                )}

                {/* User meta */}
                {group.userModel === 'User' && group.user && (
                    <div className="px-6 py-4 border-b border-white/10 flex flex-wrap gap-3 text-xs">
                        {group.user.country && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Globe size={11} className="text-gray-600" />
                                <span className="text-gray-200">{group.user.country}</span>
                            </div>
                        )}
                        {group.user.badges && group.user.badges.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {group.user.badges.slice(0, 6).map((b, i) => (
                                    <span key={i} className="bg-blue-500/10 text-blue-400 rounded px-1.5 py-0.5 text-[10px]">{b}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sessions list */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                    {group.sessions.map((session) => {
                        const presence = getPresence(session);
                        const ua = parseUA(session.userAgent);
                        const isCurrent = session.sessionId === currentSessionId;
                        return (
                            <div
                                key={session._id}
                                className={`px-6 py-4 hover:bg-white/3 transition-colors ${isCurrent ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-base">{ua.icon}</span>
                                            <span className="text-sm font-medium text-gray-200 truncate">{ua.label}</span>
                                            {isCurrent && (
                                                <Badge className="bg-blue-500/20 text-blue-400 border-none text-[9px] py-0 px-1.5 font-bold shrink-0">YOU</Badge>
                                            )}
                                            <PresenceDot status={presence} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <Globe size={10} />
                                                {session.ipAddress || '0.0.0.0'}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <Clock size={10} />
                                                Last seen {formatRelativeTime(session.lastActive || session.updatedAt)}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <Calendar size={10} />
                                                Started {formatShortDate(session.createdAt)}
                                                &nbsp;·&nbsp;
                                                Expires {formatShortDate(session.expiresAt)}
                                            </div>
                                        </div>
                                    </div>
                                    {isAlive(session) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRevoke(session.sessionId)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-[10px] shrink-0"
                                        >
                                            <LogOut size={12} className="mr-1" />
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminSessionsPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [groups, setGroups] = useState<UserGroup[]>([]);
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
    const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState(POLL_INTERVAL_MS / 1000);

    // Refs for interval management
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentSessionId(payload.sessionId);
            } catch { }
        }
    }, []);

    // ── Core fetch ──────────────────────────────────────────────────────────
    const fetchSessions = useCallback(async (): Promise<UserGroup[]> => {
        try {
            const data: UserGroup[] = await request('/api/admin/sessions');
            setGroups(data);
            setLastRefreshed(new Date());
            setCountdown(POLL_INTERVAL_MS / 1000);
            return data;
        } catch {
            toast({ title: 'Error', description: 'Failed to fetch sessions', variant: 'destructive' });
            return [];
        }
    }, [request, toast]);

    // ── Countdown ticker (cheapest possible — just a number, no re-render cost) ──
    const startCountdown = useCallback(() => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setCountdown(POLL_INTERVAL_MS / 1000);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
    }, []);

    // ── Polling — pauses when tab is hidden to save resources ──────────────
    const startPolling = useCallback(() => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(() => {
            if (!document.hidden) {
                fetchSessions().then(startCountdown);
            }
        }, POLL_INTERVAL_MS);
    }, [fetchSessions, startCountdown]);

    useEffect(() => {
        // Initial load
        fetchSessions().then(startCountdown);
        startPolling();

        // Pause/resume on tab visibility
        const onVisibilityChange = () => {
            if (!document.hidden) {
                // Tab became visible again — refresh immediately then resume polling
                fetchSessions().then(startCountdown);
                startPolling();
            } else {
                // Tab hidden — pause polling to save resources
                if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                if (countdownRef.current) clearInterval(countdownRef.current);
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [fetchSessions, startPolling, startCountdown]);

    // ── Actions ──────────────────────────────────────────────────────────────
    const handleRevoke = async (sessionId: string) => {
        if (!confirm('Are you sure? The user will be logged out.')) return;
        try {
            await request(`/api/admin/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Session revoked' });
            const fresh = await fetchSessions();
            startCountdown();
            if (selectedGroup) {
                const updated = fresh.find(g => g.userId === selectedGroup.userId);
                setSelectedGroup(updated || null);
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to revoke session', variant: 'destructive' });
        }
    };

    const handleRevokeAll = async (userId: string, username: string) => {
        if (!confirm(`Revoke ALL sessions for ${username}?`)) return;
        try {
            await request(`/api/admin/sessions?userId=${userId}`, { method: 'DELETE' });
            toast({ title: 'Success', description: `All sessions for ${username} revoked` });
            await fetchSessions();
            startCountdown();
            setSelectedGroup(null);
        } catch {
            toast({ title: 'Error', description: 'Failed to revoke sessions', variant: 'destructive' });
        }
    };

    const toggleExpand = (userId: string) => {
        setExpandedUsers(prev => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId); else next.add(userId);
            return next;
        });
    };

    // ── Aggregates ──────────────────────────────────────────────────────────
    const totalSessions = groups.reduce((a, g) => a + g.sessions.length, 0);
    const onlineCount = groups.reduce((a, g) => a + g.sessions.filter(s => getPresence(s) === 'online').length, 0);
    const awayCount = groups.reduce((a, g) => a + g.sessions.filter(s => getPresence(s) === 'away').length, 0);
    const expiredCount = groups.reduce((a, g) => a + g.sessions.filter(s => !isAlive(s)).length, 0);

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        Session Management
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                        Live presence · auto-refreshes every 60s
                        {lastRefreshed && (
                            <span className="text-gray-700">· next in {countdown}s</span>
                        )}
                    </p>
                </div>
                <Button
                    onClick={() => { fetchSessions().then(startCountdown); startPolling(); }}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 gap-2"
                    disabled={loading}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </Button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-black/40 border-white/10 p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400"><Users size={18} /></div>
                    <div>
                        <div className="text-xl font-bold text-white">{groups.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Users</div>
                    </div>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">{onlineCount}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Online Now</div>
                    </div>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400">
                        <Timer size={18} />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">{awayCount}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Away</div>
                    </div>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gray-500/10 text-gray-500"><Lock size={18} /></div>
                    <div>
                        <div className="text-xl font-bold text-white">{expiredCount}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Expired/Revoked</div>
                    </div>
                </Card>
            </div>

            {/* ── Empty state ── */}
            {groups.length === 0 && !loading && (
                <Card className="p-12 text-center bg-black/40 border-white/10">
                    <Monitor className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                    <p className="text-gray-400">No sessions found.</p>
                </Card>
            )}

            {/* ── User groups ── */}
            <div className="space-y-3">
                {groups.map((group) => {
                    const overall = bestPresence(group.sessions);
                    const aliveSessions = group.sessions.filter(isAlive);
                    const isExpanded = expandedUsers.has(group.userId);
                    const displayName = group.user?.username || group.user?.name || 'Unknown User';

                    return (
                        <div
                            key={group.userId}
                            className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm"
                        >
                            {/* ─ User row ─ */}
                            <div className="flex items-center px-5 py-4 gap-4">
                                {/* Avatar with live dot */}
                                <div className="relative shrink-0">
                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm ${group.userModel === 'Admin'
                                            ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/25'
                                            : 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/25'
                                        }`}>
                                        {getInitials(group.user, group.userModel)}
                                    </div>
                                    {/* Presence dot on avatar */}
                                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d0f1a] ${overall === 'online' ? 'bg-green-500 animate-pulse' :
                                            overall === 'away' ? 'bg-yellow-400' :
                                                overall === 'offline' ? 'bg-gray-500' : 'bg-gray-700'
                                        }`} />
                                </div>

                                {/* Name + email */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-100 truncate">{displayName}</span>
                                        {group.userModel === 'Admin' && (
                                            <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[9px] py-0 px-1.5">ADMIN</Badge>
                                        )}
                                        {group.user?.isPro && (
                                            <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 text-[9px] py-0 px-1.5">PRO</Badge>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-gray-500 truncate">{group.user?.email}</div>
                                </div>

                                {/* Presence label + counts */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <PresenceDot status={overall} />
                                    <div className="text-[10px] text-gray-600 bg-white/5 rounded px-2 py-1">
                                        {aliveSessions.length}/{group.sessions.length}
                                    </div>
                                </div>

                                {/* View details */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedGroup(group)}
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 text-[11px] shrink-0"
                                >
                                    Details
                                </Button>

                                {/* Expand toggle */}
                                <button
                                    onClick={() => toggleExpand(group.userId)}
                                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            </div>

                            {/* ─ Expanded sessions inline ─ */}
                            {isExpanded && (
                                <div className="border-t border-white/10 divide-y divide-white/5">
                                    {group.sessions.map((session) => {
                                        const presence = getPresence(session);
                                        const ua = parseUA(session.userAgent);
                                        const isCurrent = session.sessionId === currentSessionId;
                                        return (
                                            <div
                                                key={session._id}
                                                className={`flex items-center gap-4 px-6 py-3 text-sm hover:bg-white/3 transition-colors ${isCurrent ? 'border-l-2 border-blue-500 bg-blue-500/5' : ''}`}
                                            >
                                                <span className="text-base shrink-0">{ua.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-gray-300 text-xs font-medium">{ua.label}</span>
                                                        {isCurrent && (
                                                            <Badge className="bg-blue-500/20 text-blue-400 border-none text-[9px] py-0 px-1 font-bold">YOU</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-600 mt-0.5 flex-wrap">
                                                        <span><Globe size={8} className="inline mr-1" />{session.ipAddress || '0.0.0.0'}</span>
                                                        <span><Clock size={8} className="inline mr-1" />Last seen {formatRelativeTime(session.lastActive || session.updatedAt)}</span>
                                                        <span><Calendar size={8} className="inline mr-1" />Exp. {formatShortDate(session.expiresAt)}</span>
                                                    </div>
                                                </div>

                                                <PresenceDot status={presence} />

                                                {isAlive(session) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRevoke(session.sessionId)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-[10px] shrink-0"
                                                    >
                                                        Revoke
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Detail Side Panel ── */}
            {selectedGroup && (
                <SessionDetailPanel
                    group={selectedGroup}
                    currentSessionId={currentSessionId}
                    onClose={() => setSelectedGroup(null)}
                    onRevoke={handleRevoke}
                    onRevokeAll={handleRevokeAll}
                />
            )}
        </div>
    );
}
