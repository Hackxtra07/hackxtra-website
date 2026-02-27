'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';

interface Badge {
    _id: string;
    name: string;
    description: string;
    icon: string;
    requirements?: {
        minSolved?: number;
        minPoints?: number;
        requirePro?: boolean;
    };
    createdAt: string;
}

export default function AdminBadgesPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Award',
        requirements: {
            minSolved: 0,
            minPoints: 0,
            requirePro: false
        }
    });

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const data = await request('/api/badges');
            setBadges(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch badges', variant: 'destructive' });
        }
    };

    const getIcon = (name: string) => {
        const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle || LucideIcons.Award;
        return <Icon className="h-5 w-5" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await request(`/api/badges/${editingId}`, {
                    method: 'PUT',
                    body: formData,
                });
                toast({ title: 'Success', description: 'Badge updated!' });
            } else {
                await request('/api/badges', {
                    method: 'POST',
                    body: formData,
                });
                toast({ title: 'Success', description: 'Badge created!' });
            }
            resetForm();
            fetchBadges();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to save badge', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await request(`/api/badges/${id}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Badge deleted!' });
            fetchBadges();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to delete badge', variant: 'destructive' });
        }
    };

    const handleEdit = (badge: Badge) => {
        setFormData({
            name: badge.name,
            description: badge.description,
            icon: badge.icon || 'Award',
            requirements: {
                minSolved: badge.requirements?.minSolved || 0,
                minPoints: badge.requirements?.minPoints || 0,
                requirePro: badge.requirements?.requirePro || false
            }
        });
        setEditingId(badge._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            icon: 'Award',
            requirements: {
                minSolved: 0,
                minPoints: 0,
                requirePro: false
            }
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Badge Management</h1>
                <Button
                    onClick={() => (showForm ? resetForm() : setShowForm(true))}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'Add New Badge'}
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 border-2 border-blue-100 shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Badge Details</h3>
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Elite Hacker"
                                />
                            </div>
                            <div>
                                <Label>Description / Requirements Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    placeholder="e.g. Complete 50 HackXtras challenges."
                                    className="h-20"
                                />
                            </div>
                            <div>
                                <Label>Icon (Lucide React icon name)</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="Award, Trophy, Shield, etc."
                                        className="flex-1"
                                    />
                                    <div className="h-10 w-10 border rounded flex items-center justify-center bg-gray-50 text-blue-600">
                                        {getIcon(formData.icon)}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Specify a valid name from Lucide React icons library.</p>
                            </div>

                            <h3 className="font-semibold text-lg border-b pb-2 pt-4">Automation Requirements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Min. Solves</Label>
                                    <Input
                                        type="number"
                                        value={formData.requirements?.minSolved || 0}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            requirements: { ...formData.requirements, minSolved: parseInt(e.target.value) }
                                        })}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label>Min. Points</Label>
                                    <Input
                                        type="number"
                                        value={formData.requirements?.minPoints || 0}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            requirements: { ...formData.requirements, minPoints: parseInt(e.target.value) }
                                        })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="requirePro"
                                        checked={formData.requirements?.requirePro || false}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            requirements: { ...formData.requirements, requirePro: e.target.checked }
                                        })}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="requirePro">Require PRO Status</Label>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? 'Saving...' : editingId ? 'Update Badge' : 'Create Badge'}
                        </Button>
                    </form>
                </Card>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirements</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {badges.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No custom badges found.
                                </td>
                            </tr>
                        ) : badges.map((badge) => (
                            <tr key={badge._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        {getIcon(badge.icon || 'Award')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p className="line-clamp-1">{badge.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {badge.requirements?.minSolved ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {badge.requirements.minSolved} Solves
                                                </span>
                                            ) : null}
                                            {badge.requirements?.minPoints ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                    {badge.requirements.minPoints} Points
                                                </span>
                                            ) : null}
                                            {badge.requirements?.requirePro ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                    PRO Only
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(badge)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(badge._id)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
