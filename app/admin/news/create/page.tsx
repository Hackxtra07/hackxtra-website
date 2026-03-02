'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Newspaper, Upload, Image as ImageIcon, Tag, User, Save, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function CreateNewsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        author: 'Admin',
        tags: '',
        isPublished: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isPublished: checked }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            const payload = {
                ...formData,
                tags: tagsArray,
                publishedAt: formData.isPublished ? new Date() : null
            };

            const response = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Intelligence entry finalized');
                router.push('/admin/news');
            } else {
                toast.error(data.error || 'Failed to instantiate manifest');
            }
        } catch (error) {
            toast.error('An unexpected error occurred during manifestation');
        } finally {
            setLoading(false);
        }
    };

    const importFromUrl = async () => {
        const url = prompt("Enter News Source URI:");
        if (!url) return;

        try {
            const loadingToast = toast.loading("Scraping grid for metadata...");
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            toast.dismiss(loadingToast);

            if (data.error) {
                toast.error(data.error);
                return;
            }

            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                content: prev.content || data.description || '',
                image: data.image || prev.image,
            }));
            toast.success("Intelligence successfully extracted!");
        } catch (error) {
            toast.error("Failed to extract external intelligence");
        }
    };

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
                            <Newspaper className="h-7 w-7 text-indigo-400" />
                            Initialize Transmission
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">Compose and authorize new intelligence for the global feed.</p>
                    </div>
                </div>
                <Button
                    onClick={importFromUrl}
                    variant="outline"
                    className="h-12 border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 font-black uppercase tracking-widest text-[10px] rounded-2xl px-6 relative z-10"
                >
                    <Upload className="mr-2 h-4 w-4" /> Extract External Signal
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-10">
                    <Card className="p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-30" />

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
                                    className="h-14 bg-black/40 border-white/10 focus:border-indigo-500/50 rounded-2xl text-white font-bold placeholder:text-gray-800"
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Intel Narrative (Markdown)</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    placeholder="Draft the core manifestation..."
                                    className="min-h-[450px] bg-black/40 border-white/10 focus:border-indigo-500/50 rounded-3xl text-white text-sm leading-relaxed p-6 resize-none font-medium"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1 opacity-50">
                                    <Sparkles className="h-3 w-3" /> Rich formatting and markdown nodes supported
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
                                disabled={loading}
                                className="h-14 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 border border-indigo-400/20 transition-all active:scale-95"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> SYNCHRONIZING...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="h-4 w-4" /> Finalize Manifest
                                    </div>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="h-12 text-gray-500 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-xl"
                            >
                                Abort Operation
                            </Button>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
