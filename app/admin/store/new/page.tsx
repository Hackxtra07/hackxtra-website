'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    ShoppingBag, Plus, ArrowLeft, Loader2, Package,
    Zap, Activity, Shield, Globe, Database,
    Sparkles, Target, Layers
} from "lucide-react";
import Link from 'next/link';

export default function NewStoreItemPage() {
    const router = useRouter();
    const { request, loading } = useApi();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cost: 100,
        type: 'deal',
        value: '',
        stock: -1,
        isActive: true,
        image: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await request('/api/store', {
                method: 'POST',
                body: formData,
            });
            router.push('/admin/store');
        } catch (error) {
            console.error('Failed to create item');
        }
    };

    return (
        <div className="space-y-10 max-w-4xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black flex items-center gap-4 text-white tracking-tighter uppercase">
                        <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Plus className="h-6 w-6" />
                        </div>
                        Asset Instantiation
                    </h1>
                    <p className="text-gray-400 mt-1 font-medium text-xs tracking-widest uppercase">Registering new equipment in the grid.</p>
                </div>
                <Link href="/admin/store">
                    <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-white/5 h-12 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all relative z-10">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Abort Mission
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
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Core Manifest</h3>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Archive Title</Label>
                                    <Input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                                        placeholder="e.g. ULTRA-SONIC DECRYPTOR..."
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Asset Summary</Label>
                                    <Textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4 rounded-2xl placeholder:text-gray-700"
                                        placeholder="Detail the technical capabilities and procurement benefits..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Technical Specs</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Credit Cost</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white font-mono rounded-2xl"
                                    />
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
                                <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Secure Vector (Value / Link)</Label>
                                <Input
                                    required
                                    placeholder="https://vault.net/asset or SIGMA-771"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white rounded-2xl text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Stock Reservoir</Label>
                                    <Input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white rounded-2xl placeholder:text-gray-700"
                                        placeholder="-1 for Infinite"
                                    />
                                </div>

                                <div className="flex flex-col justify-end pb-1">
                                    <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${formData.isActive ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                        <div className="flex flex-col">
                                            <Label htmlFor="isActive" className="text-[9px] font-black uppercase tracking-widest text-gray-300 cursor-pointer">Live Signal</Label>
                                        </div>
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 border border-blue-400/20 rounded-2xl">
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                                Synchronizing Deployment...
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5" /> Deploy Strategic Asset
                            </div>
                        )}
                    </Button>
                </form>
            </Card>

            <div className="flex justify-center flex-col items-center gap-4 opacity-40">
                <Globe size={24} className="text-zinc-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 text-center italic">"Quality over quantity. Only elite assets are permitted."</p>
            </div>
        </div>
    );
}
