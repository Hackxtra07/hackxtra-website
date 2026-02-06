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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Card key={item._id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                            <div
                                className={`w-3 h-3 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.cost} Points</div>
                            <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                            <div className="mt-4 flex gap-2">
                                <Link href={`/admin/store/${item._id}`}>
                                    <Button variant="outline" size="sm">
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteItem(item._id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
