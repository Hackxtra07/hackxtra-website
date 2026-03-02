'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Newspaper, RefreshCw, Calendar, User, Search, Filter, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface NewsItem {
    _id: string;
    title: string;
    author: string;
    isPublished: boolean;
    publishedAt: string;
    createdAt: string;
}

import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

export default function NewsAdminPage() {
    const { request, loading: apiLoading } = useApi('admin');
    const { toast: uiToast } = useToast();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const data = await request('/api/news?admin=true');
            if (data.success) {
                setNews(data.data);
            } else {
                toast.error(data.error || 'Failed to fetch intelligence feed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to connect to news grid');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This deletion is permanent.')) return;

        try {
            const data = await request(`/api/news/${id}`, { method: 'DELETE' });
            if (data.success) {
                toast.success('Article de-manifested successfully');
                fetchNews();
            } else {
                toast.error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove article');
        }
    };

    const togglePublish = async (item: NewsItem) => {
        try {
            const data = await request(`/api/news/${item._id}`, {
                method: 'PUT',
                body: {
                    isPublished: !item.isPublished,
                    publishedAt: !item.isPublished ? new Date() : item.publishedAt
                },
            });
            if (data.success) {
                toast.success(`Article ${!item.isPublished ? 'broadcasted' : 'withdrawn'}`);
                fetchNews();
            } else {
                toast.error(data.error);
            }
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to update broadcast status');
        }
    }

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const data = await request('/api/cron/news');
            if (data.success) {
                toast.success(data.data.message || `Grid Refreshed: ${data.data.count} new signals detected`);
                fetchNews();
            } else {
                toast.error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to synchronize news grid');
        } finally {
            setLoading(false);
        }
    }

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:rotate-6 duration-500">
                            <Newspaper className="h-8 w-8" />
                        </div>
                        Intelligence Hub
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Oversee real-time information flow and curate the platform news feed.</p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto relative z-10">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="h-12 border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl px-6 transition-all flex-1 lg:flex-none"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        {loading ? 'SYNCHING...' : 'REFRESH GRID'}
                    </Button>
                    <Link href="/admin/news/create" className="flex-1 lg:flex-none">
                        <Button className="h-12 w-full px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Add Intelligence
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                <div className="md:col-span-8 relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="SEARCH ARCHIVES..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-indigo-500/50 transition-all placeholder:text-gray-700"
                    />
                </div>
                <div className="md:col-span-4">
                    <Button variant="outline" className="h-14 w-full border-white/10 bg-white/5 text-gray-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:text-white transition-all">
                        <Filter className="mr-2 h-4 w-4" /> Filter Protocol
                    </Button>
                </div>
            </div>

            {/* Registry Table */}
            <Card className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.03]">
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Manifestation Title</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Source Agent</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Transmission</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Temporal Stamp</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center text-gray-600 font-black uppercase tracking-widest text-xs">
                                        Detecting news signals...
                                    </td>
                                </tr>
                            ) : filteredNews.map((item) => (
                                <tr key={item._id} className="group hover:bg-white/[0.03] transition-all duration-500">
                                    <td className="px-8 py-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4 max-w-[400px]">
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Newspaper className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-black text-white hover:text-indigo-400 transition-colors truncate">
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <User className="h-3.5 w-3.5 text-indigo-500/50" />
                                            {item.author}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.isPublished
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${item.isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                            {item.isPublished ? 'Live Broadcast' : 'Draft Protocol'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap text-xs font-mono text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 opacity-30" />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={() => togglePublish(item)}
                                                className="p-2.5 rounded-xl border border-white/5 text-indigo-400 hover:bg-indigo-500/10 transition-all shadow-lg"
                                                title={item.isPublished ? "Withdraw Signal" : "Authorize Broadcast"}
                                            >
                                                {item.isPublished ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                            </button>
                                            <Link
                                                href={`/admin/news/${item._id}`}
                                                className="p-2.5 rounded-xl border border-white/5 text-white hover:bg-white/10 transition-all shadow-lg"
                                            >
                                                <Edit className="h-4.5 w-4.5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2.5 rounded-xl border border-white/5 text-rose-500 hover:bg-rose-500/10 transition-all shadow-lg"
                                            >
                                                <Trash2 className="h-4.5 w-4.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredNews.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <Newspaper className="h-16 w-16 text-gray-700 opacity-20" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">No intelligence detected in current frequency.</p>
                                                <p className="text-[8px] text-gray-700 font-mono tracking-widest uppercase">Adjust search filters or initialize new transmission.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Visual Accent */}
                <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none p-20 select-none">
                    <Newspaper size={500} />
                </div>
            </Card>
        </div>
    );
}
