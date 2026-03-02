'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
    ShoppingBag, Plus, Trash2, Edit2, Loader2, Package,
    Zap, Activity, Search, Shield, Globe, Layers,
    ArrowUpRight, AlertCircle, Database
} from "lucide-react";

interface StoreItem {
    _id: string;
    title: string;
    cost: number;
    type: string;
    stock: number;
    isActive: boolean;
}

export default function AdminStorePage() {
    const { request, loading } = useApi();
    const [items, setItems] = useState<StoreItem[]>([]);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const data = await request('/api/store');
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch items');
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to decommission this asset?')) return;
        try {
            await request(`/api/store/${id}`, { method: 'DELETE' });
            fetchItems();
        } catch (error) {
            console.error('Failed to delete item');
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        Equipment Depot
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Manage procurable assets and deployment inventory for the operative network.</p>
                </div>

                <div className="flex gap-4 w-full lg:w-auto relative z-10">
                    <Link href="/admin/store/new" className="flex-1 lg:flex-none">
                        <Button className="h-14 w-full px-8 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-500/20 border border-blue-400/30 rounded-2xl transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Instantiate Asset
                        </Button>
                    </Link>
                </div>
            </div>

            {loading && items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-32 gap-6">
                    <div className="relative">
                        <div className="h-20 w-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity size={24} className="text-blue-400 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 animate-pulse">Accessing Depot Archive</p>
                        <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Verifying manifest integrity...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <Card key={item._id} className="bg-white/5 border-white/10 hover:border-blue-500/40 transition-all duration-700 group relative overflow-hidden flex flex-col rounded-[2.5rem] p-1">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <Package size={120} />
                            </div>

                            <div className="p-8 pb-4 relative h-full flex flex-col">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <div className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border transition-colors ${item.isActive
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 opacity-50'
                                        }`}>
                                        {item.isActive ? 'OPERATIONAL' : 'DECOMMISSIONED'}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">CREDITS</span>
                                        <span className="text-xl font-mono font-black text-blue-400 leading-none">{item.cost.toLocaleString()}</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors truncate mt-4 mb-1">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-2 text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-6">
                                    <Database size={10} className="text-blue-500/50" />
                                    Depot Class: {item.type}
                                </div>

                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-8 relative group/stat overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/30 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                                        <span>Reserve Stock</span>
                                        <span className={item.stock < 5 ? "text-rose-500" : "text-emerald-500"}>{item.stock} UNITS</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${item.stock < 5 ? "bg-rose-500" : "bg-blue-500"}`}
                                            style={{ width: `${Math.min(100, (item.stock / 20) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <Link href={`/admin/store/${item._id}`} className="flex-1">
                                        <Button className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-[9px] transition-all">
                                            <Edit2 size={12} className="mr-2" /> RECALIBRATE
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={() => deleteItem(item._id)}
                                        className="h-11 rounded-xl bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                                    >
                                        <Trash2 size={12} className="mr-2" /> PURGE
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {items.length === 0 && !loading && (
                        <div className="col-span-full py-32 text-center bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-md opacity-30 flex flex-col items-center gap-6">
                            <Layers size={60} className="text-zinc-700" />
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Depot mainframes report zero available assets.</p>
                                <p className="text-[8px] font-mono text-zinc-800 tracking-widest uppercase">Initialize deployment sequence to populate...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-center flex-col items-center gap-4 opacity-40 mt-10">
                <Globe size={24} className="text-zinc-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 text-center italic">"Tactical superiority requires superior equipment."</p>
            </div>
        </div>
    );
}
