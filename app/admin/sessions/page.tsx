'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Shield, User, Globe, Monitor, LogOut, Clock } from 'lucide-react';

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
    user?: {
        _id: string;
        username?: string;
        name?: string;
        email: string;
    };
}

export default function AdminSessionsPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
        // Extract current sessionId from token if possible (simplified here)
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentSessionId(payload.sessionId);
            } catch (e) { }
        }
    }, []);

    const fetchSessions = async () => {
        try {
            const data = await request('/api/admin/sessions');
            setSessions(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch sessions', variant: 'destructive' });
        }
    };

    const handleRevoke = async (sessionId: string) => {
        if (!confirm('Are you sure? The user will be logged out.')) return;
        try {
            await request(`/api/admin/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Session revoked' });
            fetchSessions();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to revoke session', variant: 'destructive' });
        }
    };

    const handleRevokeAllForUser = async (userId: string, username: string) => {
        if (!confirm(`Revoke ALL sessions for ${username}?`)) return;
        try {
            await request(`/api/admin/sessions?userId=${userId}`, { method: 'DELETE' });
            toast({ title: 'Success', description: `All sessions for ${username} revoked` });
            fetchSessions();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to revoke sessions', variant: 'destructive' });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const parseUA = (ua?: string) => {
        if (!ua) return 'Unknown Device';
        if (ua.includes('Windows')) {
            if (ua.includes('Chrome')) return 'Chrome on Windows';
            if (ua.includes('Firefox')) return 'Firefox on Windows';
            if (ua.includes('Edge')) return 'Edge on Windows';
            return 'Windows Device';
        }
        if (ua.includes('Macintosh')) {
            if (ua.includes('Chrome')) return 'Chrome on Mac';
            if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari on Mac';
            return 'Mac Device';
        }
        if (ua.includes('Linux')) return 'Linux Device';
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('Android')) return 'Android Device';
        return ua.split(' ')[0] || 'Unknown Device';
    };

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    Session Management
                </h1>
                <Button
                    onClick={fetchSessions}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                    disabled={loading}
                >
                    Refresh
                </Button>
            </div>

            <div className="grid gap-6">
                {sessions.length === 0 && !loading && (
                    <Card className="p-12 text-center bg-black/40 border-white/10">
                        <Monitor className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-gray-400">No active sessions found.</p>
                    </Card>
                )}

                <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Device / IP</th>
                                    <th className="px-6 py-4">Activity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {sessions.map((session) => (
                                    <tr key={session._id} className={`hover:bg-white/5 transition-colors group ${session.sessionId === currentSessionId ? 'bg-blue-500/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${session.userModel === 'Admin' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {session.userModel === 'Admin' ? <Shield size={16} /> : <User size={16} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-200">
                                                            {session.user?.username || session.user?.name || 'Unknown'}
                                                        </span>
                                                        {session.sessionId === currentSessionId && (
                                                            <Badge className="bg-blue-500/20 text-blue-400 border-none text-[9px] py-0 px-1 font-bold">YOU</Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-mono">
                                                        {session.user?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                                    <Monitor size={12} className="text-gray-500" />
                                                    {parseUA(session.userAgent)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                    <Globe size={10} className="text-gray-600" />
                                                    {session.ipAddress || '0.0.0.0'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                                    <Clock size={12} className="text-blue-500" />
                                                    Active {formatRelativeTime(session.lastActive || session.updatedAt)}
                                                </div>
                                                <div className="text-[10px] text-gray-600">
                                                    Started {formatDate(session.createdAt)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                {session.isValid && !isExpired(session.expiresAt) ? (
                                                    <div className="flex items-center gap-1.5 text-green-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Online</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Inactive</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {session.isValid && !isExpired(session.expiresAt) && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRevoke(session.sessionId)}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-[10px]"
                                                        >
                                                            Revoke
                                                        </Button>
                                                        {session.user?._id && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRevokeAllForUser(session.user?._id!, session.user?.username || session.user?.name || 'User')}
                                                                className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 h-8 text-[10px] hidden md:flex"
                                                            >
                                                                Revoke All
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
