'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Activity, Search, Shield, Clock, HardDrive, Terminal, RefreshCw, ChevronLeft, ChevronRight, Filter, Database, Hash, User, Globe, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AdminLog {
    _id: string;
    adminName: string;
    action: string;
    targetType: string;
    targetId: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async (p: number) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/logs?page=${p}&limit=50&search=${searchTerm}`);
            setLogs(res.data.logs);
            setTotalPages(res.data.pagination.pages);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(page);
        }, 500);
        return () => clearTimeout(timer);
    }, [page, searchTerm]);

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Shield className="h-8 w-8" />
                        </div>
                        Audit Manifest
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Live surveillance · Permanent ledger active.
                    </p>
                </div>

                <div className="flex gap-4 w-full lg:w-auto relative z-10">
                    <div className="relative flex-1 lg:min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="FILTER AUDIT STREAM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 pl-12 text-sm text-white placeholder:text-gray-700 rounded-2xl"
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse relative z-10">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Temporal Marker</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Operative</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Vector</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Target Node</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Manifest details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <RefreshCw size={40} className="text-indigo-500 animate-spin opacity-20" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Terminal size={14} className="text-indigo-400 animate-pulse" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Synchronizing Manifest...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Database size={40} className="text-zinc-700" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Manifest grid empty. No audit trails detected.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: AdminLog) => (
                                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group/row">
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase">
                                                    <Clock size={12} className="text-indigo-500" />
                                                    {format(new Date(log.createdAt), 'MMM dd')}
                                                </div>
                                                <div className="text-[11px] font-black text-white font-mono tracking-tighter">
                                                    {format(new Date(log.createdAt), 'HH:mm:ss.SSS')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-black text-xs">
                                                    {log.adminName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white uppercase tracking-tight group-hover/row:text-indigo-400 transition-colors">{log.adminName}</span>
                                                    <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-1 mt-0.5 uppercase tracking-widest">
                                                        <Globe size={10} className="opacity-50" />
                                                        {log.ipAddress}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
                                                log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                                    log.action === 'UPDATE' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]' :
                                                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className={`h-1.5 w-1.5 rounded-full ${log.targetType === 'Admin' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{log.targetType}</span>
                                            </div>
                                            <div className="text-[9px] font-mono text-zinc-600 uppercase flex items-center gap-1">
                                                <Hash size={10} />
                                                {log.targetId.substring(0, 12)}...
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-start gap-3 max-w-lg transition-all group-hover/row:bg-black/40 group-hover/row:border-white/10">
                                                <Info size={14} className="text-zinc-600 mt-0.5 shrink-0" />
                                                <p className="text-xs text-zinc-400 leading-relaxed font-medium italic italic-opacity-50">
                                                    "{log.details || 'No transmission metadata provided for this action cycle.'}"
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-8 py-6 bg-white/5 border-t border-white/10 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all disabled:opacity-20"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> REWIND
                            </Button>
                            <Button
                                onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all disabled:opacity-20"
                            >
                                FORWARD <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-8 w-px bg-white/10" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                Page <span className="text-indigo-400 mx-1">{page}</span> of <span className="text-indigo-400 mx-1">{totalPages}</span>
                            </span>
                        </div>
                    </div>
                )}
            </Card>

            <div className="flex justify-center flex-col items-center gap-4 opacity-50">
                <HardDrive size={24} className="text-zinc-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 text-center italic">"Authorized access only. All vector shifts and node manipulations<br />are cryptographically sealed in the permanent Manifest Archive."</p>
            </div>
        </div>
    );
}
