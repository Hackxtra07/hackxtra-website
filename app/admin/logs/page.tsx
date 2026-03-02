'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

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

    const fetchLogs = async (p: number) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/logs?page=${p}&limit=50`);
            setLogs(res.data.logs);
            setTotalPages(res.data.pagination.pages);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
                <p className="text-gray-400">Track all administrative actions across the platform.</p>
            </div>

            <div className="bg-[#0a0a0b] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-gray-300 uppercase text-xs font-semibold tracking-wider">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            <span>Loading audit logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-white">{log.adminName}</div>
                                            <div className="text-xs text-gray-500">{log.ipAddress}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                                                    log.action === 'CREATE' ? 'bg-green-500/10 text-green-500' :
                                                        log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-gray-500/10 text-gray-400'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white">{log.targetType}</div>
                                            <div className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{log.targetId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-400 max-w-md truncate">
                                                {log.details || '-'}
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
                    <div className="px-6 py-4 bg-white/5 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
