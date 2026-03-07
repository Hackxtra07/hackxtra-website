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
    const map: Record<PresenceStatus, { dot: string; pulse: boolean; label: string; text: string; bg: string }> = {
        online: { dot: 'bg-emerald-500', pulse: true, label: 'Active Signal', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        away: { dot: 'bg-amber-400', pulse: false, label: 'Idle Signal', text: 'text-amber-400', bg: 'bg-amber-400/10' },
        offline: { dot: 'bg-zinc-600', pulse: false, label: 'Signal Lost', text: 'text-zinc-500', bg: 'bg-zinc-500/10' },
        expired: { dot: 'bg-zinc-700', pulse: false, label: 'Manifest Expired', text: 'text-zinc-600', bg: 'bg-zinc-700/10' },
        revoked: { dot: 'bg-rose-800', pulse: false, label: 'Credential Revoked', text: 'text-rose-700', bg: 'bg-rose-900/10' },
    };
    const { dot, pulse, label, text, bg } = map[status];
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-md ${bg} ${text} text-[9px] font-black uppercase tracking-widest`}>
            <span className="relative flex h-2 w-2">
                {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`}></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${dot}`}></span>
            </span>
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative z-10 w-full sm:max-w-xl h-full bg-zinc-950 border-t sm:border-t-0 sm:border-l border-white/10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-full duration-700">
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 via-transparent to-purple-500 opacity-30 shadow-[0_0_20px_rgba(99,102,241,0.3)]" />

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-10 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className={`h-20 w-20 rounded-3xl flex items-center justify-center text-2xl font-black shadow-2xl relative z-10 ${group.userModel === 'Admin'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                                }`}>
                                {getInitials(group.user, group.userModel)}
                            </div>
                            <div className="absolute -inset-2 bg-indigo-500/20 rounded-[2rem] blur-xl opacity-20" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">{displayName}</h2>
                                {group.userModel === 'Admin' && (
                                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[9px] font-black tracking-widest px-2 py-0.5">CORE ADMIN</Badge>
                                )}
                                {group.user?.isPro && (
                                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[9px] font-black tracking-widest px-2 py-0.5">ELITE</Badge>
                                )}
                            </div>
                            <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-widest">{group.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/[0.01] border-b border-white/10">
                    <div className="py-6 px-4 text-center group cursor-default">
                        <div className="text-sm font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Total Signals</div>
                        <div className="text-2xl font-black text-white font-mono">{group.sessions.length}</div>
                    </div>
                    <div className="py-6 px-4 text-center group cursor-default">
                        <div className="text-sm font-black text-emerald-900 uppercase tracking-[0.2em] mb-1">Active</div>
                        <div className="text-2xl font-black text-emerald-500 font-mono">{aliveSessions.length}</div>
                    </div>
                    <div className="py-6 px-4 text-center group cursor-default">
                        <div className="text-sm font-black text-rose-900 uppercase tracking-[0.2em] mb-1">Dormant</div>
                        <div className="text-2xl font-black text-rose-500 font-mono">{group.sessions.length - aliveSessions.length}</div>
                    </div>
                </div>

                {/* User Bio/Meta */}
                <div className="px-8 py-6 bg-black/40 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Security Parameters</h3>
                        <PresenceDot status={overall} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest">
                        {group.user?.country && (
                            <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <Globe size={12} className="text-indigo-500" />
                                <span>{group.user.country}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <Activity size={12} className="text-indigo-500" />
                            <span>LVL: {group.user?.badges?.length || 0} CERT</span>
                        </div>
                    </div>
                </div>

                {/* Sessions list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                    <div className="px-8 py-4 flex justify-between items-center sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10 border-b border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Active Handshakes</h3>
                        {aliveSessions.length > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onRevokeAll(group.userId, displayName)}
                                className="text-rose-500 hover:text-white hover:bg-rose-500/10 text-[9px] font-black uppercase tracking-widest border border-rose-500/20 h-7"
                            >
                                Force Global Logout
                            </Button>
                        )}
                    </div>

                    <div className="divide-y divide-white/5">
                        {group.sessions.map((session) => {
                            const presence = getPresence(session);
                            const ua = parseUA(session.userAgent);
                            const isCurrent = session.sessionId === currentSessionId;
                            return (
                                <div
                                    key={session._id}
                                    className={`px-8 py-8 hover:bg-white/[0.02] transition-all group/row ${isCurrent ? 'bg-indigo-500/5' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/10">
                                                    {ua.icon}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-zinc-100 uppercase tracking-tight">{ua.label}</span>
                                                        {isCurrent && (
                                                            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest">OWN SIGNAL</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                                                        <Globe size={10} className="text-indigo-500/50" />
                                                        {session.ipAddress || '0.0.0.0'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Last Pulse</p>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                                                        <Clock size={12} className="text-indigo-500" />
                                                        {formatRelativeTime(session.lastActive || session.updatedAt)}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Established</p>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                                                        <Calendar size={12} className="text-indigo-500" />
                                                        {formatShortDate(session.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <PresenceDot status={presence} />
                                                <span className="text-[9px] font-mono text-zinc-600 uppercase">EXP: {formatShortDate(session.expiresAt)}</span>
                                            </div>
                                        </div>

                                        {isAlive(session) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onRevoke(session.sessionId)}
                                                className="text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 h-10 w-10 p-0 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
                                            >
                                                <LogOut size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Warning */}
                <div className="p-6 bg-zinc-950 border-t border-white/10">
                    <div className="flex items-center gap-4 text-zinc-600">
                        <Shield size={24} className="opacity-20 shrink-0" />
                        <p className="text-[9px] font-medium leading-relaxed italic opacity-50">"All session manipulations are logged in the core manifest. Authorized personnel only. Signal revocation will result in immediate termination of the client's handshake."</p>
                    </div>
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
        const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentSessionId(payload.sessionId);
            } catch { }
        }
    }, [groups]); // Re-check when groups update to ensure we identify own signal correctly

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
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Activity className="h-8 w-8" />
                        </div>
                        Signal Control
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live handshake monitoring · Auto-sync active.
                    </p>
                </div>

                <div className="flex gap-4 w-full lg:w-auto relative z-10">
                    <div className="flex flex-col items-end justify-center px-4 border-r border-white/10 py-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Next Synchronization</span>
                        <span className="text-sm font-mono font-black text-indigo-400">{countdown}S</span>
                    </div>
                    <Button
                        onClick={() => { fetchSessions().then(startCountdown); startPolling(); }}
                        className="h-14 px-8 bg-indigo-600 border border-indigo-400/30 text-white hover:bg-indigo-500 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-indigo-500/20 transition-all flex-1 lg:flex-none"
                        disabled={loading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'SYNCING...' : 'FORCE SYNC'}
                    </Button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Identified Users', val: groups.length, icon: Users, color: 'indigo', desc: 'Authorized operatives' },
                    { label: 'Active Signals', val: onlineCount, icon: Wifi, color: 'emerald', desc: 'Real-time telemetry', pulse: true },
                    { label: 'Idle Signals', val: awayCount, icon: Timer, color: 'amber', desc: 'Latent handshakes' },
                    { label: 'Signals Lost', val: expiredCount, icon: Lock, color: 'rose', desc: 'Terminated sessions' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 p-6 rounded-[2rem] backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all">
                        <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <stat.icon size={100} />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20`}>
                                <stat.icon size={20} className={stat.pulse ? 'animate-pulse' : ''} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white tracking-tighter">{stat.val}</span>
                            <span className="text-[10px] text-zinc-600 font-medium uppercase">{stat.desc}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty state */}
            {groups.length === 0 && !loading && (
                <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-md">
                    <div className="inline-flex p-10 rounded-full bg-white/5 border border-white/10 mb-6 text-zinc-700">
                        <Monitor size={60} strokeWidth={1} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Matrix signal grid empty. No active handshakes detected.</p>
                </div>
            )}

            {/* User Group List */}
            <div className="grid grid-cols-1 gap-6">
                {groups.map((group) => {
                    const overall = bestPresence(group.sessions);
                    const aliveSessions = group.sessions.filter(isAlive);
                    const isExpanded = expandedUsers.has(group.userId);
                    const displayName = group.user?.username || group.user?.name || 'Unknown Operative';

                    return (
                        <div
                            key={group.userId}
                            className={`group relative rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-white/5 border-white/20' : 'bg-white/[0.03] border-white/10 hover:border-white/20'}`}
                        >
                            {/* User Row */}
                            <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-6 relative z-10">
                                {/* Avatar */}
                                <div className="relative group/avatar">
                                    <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center font-black text-lg transition-transform duration-500 group-hover/avatar:scale-105 ${group.userModel === 'Admin'
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        }`}>
                                        {getInitials(group.user, group.userModel)}
                                    </div>
                                    <div className="absolute -inset-1 bg-white/10 rounded-[1.7rem] blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                </div>

                                {/* Identity */}
                                <div className="flex-1 text-center md:text-left min-w-0">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                        <span className="text-lg font-black text-white uppercase tracking-tight truncate">{displayName}</span>
                                        {group.userModel === 'Admin' && (
                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">CORE</span>
                                        )}
                                        {group.user?.isPro && (
                                            <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">ELITE</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                                        <span className="truncate">{group.user?.email}</span>
                                        <span className="hidden md:inline text-zinc-800">|</span>
                                        <span className="text-indigo-400/70">{group.user?.country || 'GLOBAL'}</span>
                                    </div>
                                </div>

                                {/* Signal Status Overlay */}
                                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Cluster Activity</p>
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-sm font-mono font-black text-white">{aliveSessions.length} <span className="text-zinc-700 text-[10px]">/ {group.sessions.length}</span></span>
                                        </div>
                                    </div>

                                    <PresenceDot status={overall} />

                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="sm"
                                            onClick={() => setSelectedGroup(group)}
                                            className="h-10 px-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                                        >
                                            INSPECT
                                        </Button>
                                        <button
                                            onClick={() => toggleExpand(group.userId)}
                                            className={`p-3 rounded-full transition-all duration-300 ${isExpanded ? 'bg-indigo-500 text-white rotate-180 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-zinc-600 hover:text-white hover:bg-white/10'}`}
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Inline Session Grid (Expanded) */}
                            {isExpanded && (
                                <div className="p-8 pt-0 border-t border-white/5 animate-in slide-in-from-top-4 duration-500 overflow-hidden">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                        {group.sessions.map((session) => {
                                            const presence = getPresence(session);
                                            const ua = parseUA(session.userAgent);
                                            const isCurrent = session.sessionId === currentSessionId;
                                            return (
                                                <div
                                                    key={session._id}
                                                    className={`p-6 rounded-3xl border transition-all relative group/session ${isCurrent ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/5 shadow-inner">
                                                            {ua.icon}
                                                        </div>
                                                        {isCurrent && (
                                                            <span className="text-[8px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 uppercase">LOCAL NODE</span>
                                                        )}
                                                    </div>

                                                    <h4 className="text-xs font-black text-white uppercase tracking-tight mb-4 truncate">{ua.label}</h4>

                                                    <div className="space-y-3 mb-6">
                                                        <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-tighter">
                                                            <span className="text-zinc-600">IP ADDRESS</span>
                                                            <span className="text-zinc-300 font-mono">{session.ipAddress || '0.0.0.0'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-tighter">
                                                            <span className="text-zinc-600">LAST PULSE</span>
                                                            <span className="text-zinc-300 font-mono italic">{formatRelativeTime(session.lastActive || session.updatedAt)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                        <div className="flex items-baseline gap-1">
                                                            <div className={`h-1.5 w-1.5 rounded-full ${presence === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                                                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{presence}</span>
                                                        </div>
                                                        {isAlive(session) && (
                                                            <button
                                                                onClick={() => handleRevoke(session.sessionId)}
                                                                className="text-rose-500/50 hover:text-rose-500 transition-colors"
                                                            >
                                                                <LogOut size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Sidebar Visualizer Overlay */}
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
