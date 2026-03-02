'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

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
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await request(`/api/store/${id}`, { method: 'DELETE' });
            fetchItems();
        } catch (error) {
            console.error('Failed to delete item');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Store Management</h1>
                <Link href="/admin/store/new">
                    <Button>Add New Item</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <Card key={item._id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md group hover:border-blue-500/50 transition-all flex flex-col">
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${item.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {item.isActive ? 'Active' : 'Offline'}
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Cost</div>
                                    <div className="text-xl font-mono font-bold text-blue-400">{item.cost}</div>
                                </div>
                            </div>

                            <h3 className="font-bold text-white text-lg mb-2 truncate group-hover:text-blue-400 transition-colors">{item.title}</h3>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-6">{item.type} • {item.stock} in stock</p>

                            <div className="flex gap-2 mt-auto">
                                <Link href={`/admin/store/${item._id}`} className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 text-xs h-9">
                                        Edit Item
                                    </Button>
                                </Link>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteItem(item._id)}
                                    className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all text-xs h-9"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

        </div>
    );
}
