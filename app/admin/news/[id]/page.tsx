'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Newspaper, Tag, User, Save, X, Sparkles, Image as ImageIcon, History } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        author: '',
        tags: '',
        isPublished: false,
    });

    useEffect(() => {
        fetchNewsItem();
    }, []);

    const fetchNewsItem = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/news/${resolvedParams.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();
            if (data.success) {
                const item = data.data;
                setFormData({
                    title: item.title,
                    content: item.content,
                    image: item.image || '',
                    author: item.author,
                    tags: item.tags ? item.tags.join(', ') : '',
                    isPublished: item.isPublished,
                });
            } else {
                toast.error('Failed to access encrypted archive');
                router.push('/admin/news');
            }
        } catch (error) {
            toast.error('Manifest retrieval failed');
            router.push('/admin/news');
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isPublished: checked }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('adminToken');
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            const payload = {
                ...formData,
                tags: tagsArray,
            };

            const response = await fetch(`/api/news/${resolvedParams.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Intelligence recalibrated successfully');
                router.push('/admin/news');
            } else {
                toast.error(data.error || 'Failed to update manifest core');
            }
        } catch (error) {
            toast.error('An unexpected error occurred during recalibration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">Decrypting Signal...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <Link href="/admin/news">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                            <History className="h-7 w-7 text-amber-400" />
                            Recalibrate Signal
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">Modify existing intelligence parameters and broadcast status.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    LIVE EDIT MODE
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-10">
                    <Card className="p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-30" />

                        <div className="space-y-8">
                            <div className="grid gap-3">
                                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Transmission Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Enter report headline..."
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="h-14 bg-black/40 border-white/10 focus:border-amber-500/50 rounded-2xl text-white font-bold placeholder:text-gray-800"
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Intel Narrative (Markdown)</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    placeholder="Draft the core manifestation..."
                                    className="min-h-[450px] bg-black/40 border-white/10 focus:border-amber-500/50 rounded-3xl text-white text-sm leading-relaxed p-6 resize-none font-medium"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1 opacity-50">
                                    <Sparkles className="h-3 w-3" /> Core intelligence data supports full markdown synchronization
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Metadata Card */}
                    <Card className="p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 border-b border-white/5 pb-4 mb-2 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-indigo-400" /> Manifest Details
                        </h3>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="author" className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Reporting Agent</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                    <Input
                                        id="author"
                                        name="author"
                                        placeholder="Agent ID"
                                        value={formData.author}
                                        onChange={handleChange}
                                        required
                                        className="h-12 pl-12 bg-black/20 border-white/10 rounded-xl text-white text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Classification Tags</Label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                    <Input
                                        id="tags"
                                        name="tags"
                                        placeholder="cyber, ai, alert"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        className="h-12 pl-12 bg-black/20 border-white/10 rounded-xl text-white text-xs font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Image / Media Card */}
                    <Card className="p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md space-y-6 overflow-hidden relative">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 border-b border-white/5 pb-4 mb-2 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-indigo-400" /> Visual Feed
                        </h3>

                        <div className="grid gap-3">
                            <Label htmlFor="image" className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Asset URI</Label>
                            <Input
                                id="image"
                                name="image"
                                placeholder="https://..."
                                value={formData.image}
                                onChange={handleChange}
                                className="h-12 bg-black/20 border-white/10 rounded-xl text-white text-[10px] font-mono"
                            />
                        </div>

                        {formData.image ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 group shadow-2xl">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3 text-gray-700">
                                <ImageIcon className="h-8 w-8 opacity-20" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">No Visual Attached</span>
                            </div>
                        )}
                    </Card>

                    {/* Authorization Card */}
                    <Card className="p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Broadcast Protocol</h3>
                                <p className="text-[9px] text-emerald-500/50 font-bold mt-1">Status: {formData.isPublished ? 'PUBLIC' : 'INTERNAL'}</p>
                            </div>
                            <Switch
                                id="isPublished"
                                checked={formData.isPublished}
                                onCheckedChange={handleSwitchChange}
                                className="data-[state=checked]:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-14 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-amber-500/20 border border-amber-400/20 transition-all active:scale-95"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> RECALIBRATING...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="h-4 w-4" /> Finalize Changes
                                    </div>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="h-12 text-gray-500 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-xl"
                            >
                                Discard Edits
                            </Button>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
