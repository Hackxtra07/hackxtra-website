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
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Store Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cost (Points)</Label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="deal">Deal</SelectItem>
                                        <SelectItem value="resource">Resource</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Value (Code / Link / Secret Content)</Label>
                            <Textarea
                                required
                                placeholder="https://example.com/resource or PROMO-CODE-123"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Stock (-1 for infinite)</Label>
                            <Input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label>Active (Visible in Store)</Label>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Creating...' : 'Create Item'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
