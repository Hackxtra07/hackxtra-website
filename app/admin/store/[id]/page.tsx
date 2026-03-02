'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Save, ShoppingBag, Zap, Globe, Database, Sparkles, Layers, Package, Trash2, Activity } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function EditStoreItemPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cost: 0,
        type: 'deal',
        value: '',
        stock: -1,
        isActive: true,
        image: ''
    });

    useEffect(() => {
        fetchItem();
    }, []);

    const fetchItem = async () => {
        try {
            const data = await request(`/api/store/${resolvedParams.id}`);
            setFormData(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to access depot archive', variant: 'destructive' });
            router.push('/admin/store');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await request(`/api/store/${resolvedParams.id}`, {
                method: 'PUT',
                body: formData,
            });
            toast({ title: 'Success', description: 'Asset reconfiguration finalized' });
            router.push('/admin/store');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to synchronize repository', variant: 'destructive' });
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">Accessing Encrypted Asset Node...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-4xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                            Asset Reconfiguration
                        </h1>
                        <p className="text-gray-400 mt-1 font-medium text-xs tracking-widest uppercase flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                            Modifying Registry Archive: {resolvedParams.id}
                        </p>
                    </div>
                </div>
                <Link href="/admin/store">
                    <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-white/5 h-12 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all relative z-10">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Discard Manifest
                    </Button>
                </Link>
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative rounded-[2.5rem]">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Registry Parameters</h3>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Archive Title</Label>
                                    <Input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                                        placeholder="Identification handle..."
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Asset Intelligence</Label>
                                    <Textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4 rounded-2xl placeholder:text-gray-700 font-medium"
                                        placeholder="Transmission metadata and operational utility..."
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Visual Asset URI</Label>
                                    <Input
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl text-[10px] font-mono"
                                        placeholder="https://depot.net/visual-node.opt"
                                    />
                                    {formData.image && (
                                        <div className="mt-2 aspect-video w-full rounded-2xl border border-white/10 overflow-hidden relative group scale-[0.98] hover:scale-100 transition-transform duration-500">
                                            <img src={formData.image} className="w-full h-full object-cover" alt="Asset Preview" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Resource Attributes</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Credit Cost</Label>
                                    <div className="relative">
                                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                                        <Input
                                            type="number"
                                            required
                                            value={formData.cost}
                                            onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
                                            className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 pl-12 text-white font-mono font-black text-lg rounded-2xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Asset Class</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger className="bg-black/40 border-white/10 h-14 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="deal" className="text-[10px] font-black uppercase tracking-widest">Strategic Deal</SelectItem>
                                            <SelectItem value="resource" className="text-[10px] font-black uppercase tracking-widest">Digital Resource</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Secure Load Vector (Value)</Label>
                                <div className="relative">
                                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                    <Input
                                        required
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 pl-12 text-white rounded-2xl text-xs font-mono"
                                        placeholder="Secret content node/link"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Reservoir Stock</Label>
                                    <div className="relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                        <Input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                            className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 pl-12 text-white rounded-2xl font-mono"
                                            placeholder="-1: Infinite"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end pb-1">
                                    <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${formData.isActive ? 'bg-emerald-500/5 border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                        <div className="flex flex-col">
                                            <Label htmlFor="isActive" className="text-[9px] font-black uppercase tracking-widest text-gray-300 cursor-pointer">Live Signal</Label>
                                        </div>
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                            className="data-[state=checked]:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-xl shadow-blue-500/20 border border-blue-400/20 rounded-2xl active:scale-95 transition-all"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                                    Synchronizing Manifest...
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Save className="h-5 w-5" /> Finalize Calibration
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="flex justify-center flex-col items-center gap-4 opacity-40">
                <Globe size={24} className="text-zinc-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 text-center italic leading-relaxed">
                    "Authorized access parameters only.<br />All registry shifts are cryptographically logged."
                </p>
            </div>
        </div>
    );
}
