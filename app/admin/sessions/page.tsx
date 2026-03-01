'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import {
    Shield, User, Globe, Monitor, LogOut, Clock, ChevronDown,
    ChevronRight, RefreshCw, Users, Activity, Lock, XCircle, CheckCircle,
    X, Calendar, Laptop
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

// ─── Helpers ────────────────────────────────────────────────────────────────
const isSessionActive = (session: Session): boolean =>
    session.isValid && new Date(session.expiresAt) > new Date();

const formatDate = (d: string) => new Date(d).toLocaleString();
const formatShortDate = (d: string) => new Date(d).toLocaleDateString();

const formatRelativeTime = (dateString: string) => {
    const diffInSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const parseUA = (ua?: string) => {
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
    const activeSessions = group.sessions.filter(isSessionActive);
    const displayName = group.user?.username || group.user?.name || 'Unknown User';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-lg h-full bg-[#0d0f1a] border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-indigo-900/20">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg ${group.userModel === 'Admin' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' : 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'}`}>
                            {getInitials(group.user, group.userModel)}
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

                {/* Stats Bar */}
                <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/3 border-b border-white/10">
                    <div className="py-3 px-4 text-center">
                        <div className="text-xl font-bold text-white">{group.sessions.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total</div>
                    </div>
                    <div className="py-3 px-4 text-center">
                        <div className="text-xl font-bold text-green-400">{activeSessions.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Active</div>
                    </div>
                    <div className="py-3 px-4 text-center">
                        <div className="text-xl font-bold text-gray-400">{group.sessions.length - activeSessions.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Expired</div>
                    </div>
                </div>

                {/* Action */}
                {activeSessions.length > 0 && (
                    <div className="px-6 py-3 border-b border-white/10 flex justify-end">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRevokeAll(group.userId, displayName)}
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-xs gap-2"
                        >
                            <LogOut size={13} />
                            Revoke All Active Sessions
                        </Button>
                    </div>
                )}

                {/* User Info */}
                {group.userModel === 'User' && group.user && (
                    <div className="px-6 py-4 border-b border-white/10 grid grid-cols-2 gap-3 text-xs">
                        {group.user.country && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Globe size={12} className="text-gray-600" />
                                Country: <span className="text-gray-200">{group.user.country}</span>
                            </div>
                        )}
                        {group.user.badges && group.user.badges.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-400 col-span-2 flex-wrap">
                                <span>Badges:</span>
                                {group.user.badges.slice(0, 5).map((b, i) => (
                                    <span key={i} className="bg-blue-500/10 text-blue-400 rounded px-1.5 py-0.5 text-[10px]">{b}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                    {group.sessions.map((session) => {
                        const active = isSessionActive(session);
                        const ua = parseUA(session.userAgent);
                        const isCurrent = session.sessionId === currentSessionId;
                        return (
                            <div
                                key={session._id}
                                className={`px-6 py-4 transition-colors hover:bg-white/3 ${isCurrent ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Device + Current badge */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-base">{ua.icon}</span>
                                            <span className="text-sm font-medium text-gray-200 truncate">{ua.label}</span>
                                            {isCurrent && (
                                                <Badge className="bg-blue-500/20 text-blue-400 border-none text-[9px] py-0 px-1.5 font-bold shrink-0">YOU</Badge>
                                            )}
                                            {/* Status */}
                                            {active ? (
                                                <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-600 text-[10px] font-bold uppercase tracking-widest shrink-0">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />
                                                    {!session.isValid ? 'Revoked' : 'Expired'}
                                                </span>
                                            )}
                                        </div>

                                        {/* IP + Timing */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <Globe size={10} />
                                                {session.ipAddress || '0.0.0.0'}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <Clock size={10} />
                                                Last active {formatRelativeTime(session.lastActive || session.updatedAt)}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <Calendar size={10} />
                                                Created {formatShortDate(session.createdAt)}
                                                &nbsp;·&nbsp;
                                                Expires {formatShortDate(session.expiresAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revoke button */}
                                    {active && (
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

    useEffect(() => {
        fetchSessions();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentSessionId(payload.sessionId);
            } catch { }
        }
    }, []);

    const fetchSessions = async (): Promise<UserGroup[]> => {
        try {
            const data: UserGroup[] = await request('/api/admin/sessions');
            setGroups(data);
            return data;
        } catch {
            toast({ title: 'Error', description: 'Failed to fetch sessions', variant: 'destructive' });
            return [];
        }
    };

    const handleRevoke = async (sessionId: string) => {
        if (!confirm('Are you sure? The user will be logged out.')) return;
        try {
            await request(`/api/admin/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Session revoked' });
            const freshGroups = await fetchSessions();
            // Refresh detail panel with fresh data
            if (selectedGroup) {
                const updated = freshGroups.find(g => g.userId === selectedGroup.userId);
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
            setSelectedGroup(null);
        } catch {
            toast({ title: 'Error', description: 'Failed to revoke sessions', variant: 'destructive' });
        }
    };

    const toggleExpand = (userId: string) => {
        setExpandedUsers(prev => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    };

    const openDetail = (group: UserGroup) => setSelectedGroup(group);

    // Aggregate stats
    const totalSessions = groups.reduce((acc, g) => acc + g.sessions.length, 0);
    const totalActive = groups.reduce((acc, g) => acc + g.sessions.filter(isSessionActive).length, 0);
    const totalUsers = groups.length;

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        Session Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Sessions are grouped by user • expired sessions are automatically detected
                    </p>
                </div>
                <Button
                    onClick={fetchSessions}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 gap-2"
                    disabled={loading}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </Button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-black/40 border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                        <Users size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{totalUsers}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Users with Sessions</div>
                    </div>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{totalActive}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Active Sessions</div>
                    </div>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gray-500/10 text-gray-400">
                        <Lock size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{totalSessions - totalActive}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Expired / Revoked</div>
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

            {/* ── User Groups ── */}
            <div className="space-y-3">
                {groups.map((group) => {
                    const activeSessions = group.sessions.filter(isSessionActive);
                    const isExpanded = expandedUsers.has(group.userId);
                    const displayName = group.user?.username || group.user?.name || 'Unknown User';

                    return (
                        <div
                            key={group.userId}
                            className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm transition-all"
                        >
                            {/* ─ User row ─ */}
                            <div className="flex items-center px-5 py-4 gap-4">
                                {/* Avatar */}
                                <div
                                    className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${group.userModel === 'Admin'
                                        ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/25'
                                        : 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/25'
                                        }`}
                                >
                                    {getInitials(group.user, group.userModel)}
                                </div>

                                {/* Info */}
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

                                {/* Session counts */}
                                <div className="flex items-center gap-3 shrink-0">
                                    {activeSessions.length > 0 ? (
                                        <div className="flex items-center gap-1.5 text-green-400 text-xs">
                                            <CheckCircle size={12} />
                                            <span className="font-bold">{activeSessions.length}</span>
                                            <span className="text-gray-600">active</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                                            <XCircle size={12} />
                                            <span>No active</span>
                                        </div>
                                    )}
                                    <div className="text-[10px] text-gray-600 bg-white/5 rounded px-2 py-1">
                                        {group.sessions.length} total
                                    </div>
                                </div>

                                {/* View details button */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openDetail(group)}
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 text-[11px] shrink-0"
                                >
                                    View Details
                                </Button>

                                {/* Expand toggle */}
                                <button
                                    onClick={() => toggleExpand(group.userId)}
                                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                                    title={isExpanded ? 'Collapse' : 'Expand sessions'}
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            </div>

                            {/* ─ Expanded inline sessions ─ */}
                            {isExpanded && (
                                <div className="border-t border-white/10 divide-y divide-white/5">
                                    {group.sessions.map((session) => {
                                        const active = isSessionActive(session);
                                        const ua = parseUA(session.userAgent);
                                        const isCurrent = session.sessionId === currentSessionId;
                                        return (
                                            <div
                                                key={session._id}
                                                className={`flex items-center gap-4 px-6 py-3 text-sm hover:bg-white/3 transition-colors ${isCurrent ? 'border-l-2 border-blue-500 bg-blue-500/5' : 'pl-[25px]'}`}
                                            >
                                                {/* Device icon */}
                                                <span className="text-base shrink-0">{ua.icon}</span>

                                                {/* Device + IP */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-gray-300 text-xs font-medium">{ua.label}</span>
                                                        {isCurrent && (
                                                            <Badge className="bg-blue-500/20 text-blue-400 border-none text-[9px] py-0 px-1 font-bold">YOU</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-600 mt-0.5">
                                                        <span><Globe size={8} className="inline mr-1" />{session.ipAddress || '0.0.0.0'}</span>
                                                        <span><Clock size={8} className="inline mr-1" />Active {formatRelativeTime(session.lastActive || session.updatedAt)}</span>
                                                        <span><Calendar size={8} className="inline mr-1" />Expires {formatShortDate(session.expiresAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                {active ? (
                                                    <div className="flex items-center gap-1.5 text-green-400 shrink-0">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-gray-600 shrink-0">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            {!session.isValid ? 'Revoked' : 'Expired'}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Revoke */}
                                                {active && (
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
