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
    createdAt: string;
    user?: {
        username?: string;
        name?: string;
        email: string;
    };
}

export default function AdminSessionsPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        fetchSessions();
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
        if (!confirm('Are you sure you want to revoke this session? The user will be logged out.')) return;
        try {
            await request(`/api/admin/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Session revoked successfully' });
            fetchSessions();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to revoke session', variant: 'destructive' });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    Active Sessions
                </h1>
                <Button
                    onClick={fetchSessions}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                    disabled={loading}
                >
                    Refresh List
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
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">User / Identity</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Environment</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Session ID</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.map((session) => (
                                    <tr key={session._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${session.userModel === 'Admin' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {session.userModel === 'Admin' ? <Shield size={18} /> : <User size={18} />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-200">
                                                        {session.user?.username || session.user?.name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {session.user?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Globe size={14} className="text-gray-500" />
                                                    {session.ipAddress || 'Unknown IP'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Monitor size={14} className="text-gray-500" />
                                                    <span className="truncate max-w-[200px]" title={session.userAgent}>
                                                        {session.userAgent || 'Unknown Device'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                {session.isValid && !isExpired(session.expiresAt) ? (
                                                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                                                ) : isExpired(session.expiresAt) ? (
                                                    <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Expired</Badge>
                                                ) : (
                                                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Revoked</Badge>
                                                )}
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                    <Clock size={10} />
                                                    {isExpired(session.expiresAt) ? 'Expired ' : 'Expires '}
                                                    {formatDate(session.expiresAt)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-mono text-gray-500 bg-white/5 py-1 px-2 rounded w-fit">
                                                {session.sessionId.substring(0, 8)}...
                                            </div>
                                            <div className="text-[10px] text-gray-600 mt-1">
                                                Created {formatDate(session.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {session.isValid && !isExpired(session.expiresAt) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRevoke(session.sessionId)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <LogOut size={16} className="mr-2" />
                                                    Revoke
                                                </Button>
                                            )}
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
