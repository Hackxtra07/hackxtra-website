'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Code, PenTool, Terminal, Shield, Cpu, Users } from "lucide-react";

interface Position {
    _id: string;
    title: string;
    type: string;
    description: string;
    skills: string[];
    requirements: string[];
    icon: string;
    isOpen: boolean;
}

const icons = ['Code', 'PenTool', 'Terminal', 'Shield', 'Cpu', 'Users', 'Briefcase'];

export default function AdminPositionsPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [positions, setPositions] = useState<Position[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Volunteer',
        description: '',
        skills: '',
        requirements: '',
        icon: 'Code',
        isOpen: true,
    });

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            // Fetch all (admin view matches public all but we might want to filter? 
            // Use ?admin=true to check functionality if we implemented it, but defaults work)
            const data = await request('/api/positions?admin=true');
            setPositions(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch positions', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                title: formData.title,
                type: formData.type,
                description: formData.description,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                requirements: formData.requirements.split('\n').map(r => r.trim()).filter(r => r),
                icon: formData.icon,
                isOpen: formData.isOpen,
            };

            if (editingId) {
                await request(`/api/positions/${editingId}`, {
                    method: 'PUT',
                    body,
                });
                toast({ title: 'Success', description: 'Position updated!' });
            } else {
                await request('/api/positions', {
                    method: 'POST',
                    body,
                });
                toast({ title: 'Success', description: 'Position created!' });
            }
            resetForm();
            fetchPositions();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save position', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await request(`/api/positions/${id}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Position deleted!' });
            fetchPositions();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete position', variant: 'destructive' });
        }
    };

    const handleEdit = (pos: Position) => {
        setFormData({
            title: pos.title,
            type: pos.type,
            description: pos.description,
            skills: pos.skills.join(', '),
            requirements: pos.requirements.join('\n'),
            icon: pos.icon || 'Code',
            isOpen: pos.isOpen,
        });
        setEditingId(pos._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'Volunteer',
            description: '',
            skills: '',
            requirements: '',
            icon: 'Code',
            isOpen: true,
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Position Management</h1>
                <Button
                    onClick={() => (showForm ? resetForm() : setShowForm(true))}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'Add New Position'}
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 border-2 border-blue-100 shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="e.g. Frontend Developer"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Type</Label>
                                        <Input
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            required
                                            placeholder="e.g. Volunteer"
                                        />
                                    </div>
                                    <div>
                                        <Label>Icon</Label>
                                        <Select
                                            value={formData.icon}
                                            onValueChange={(val) => setFormData({ ...formData, icon: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Icon" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {icons.map(i => (
                                                    <SelectItem key={i} value={i}>{i}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label>Skills (comma separated)</Label>
                                    <Input
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        placeholder="React, TypeScript, CSS"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="isOpen"
                                            checked={formData.isOpen}
                                            onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                        />
                                        <Label htmlFor="isOpen">Position Open</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        className="h-20"
                                    />
                                </div>
                                <div>
                                    <Label>Requirements (one per line)</Label>
                                    <Textarea
                                        value={formData.requirements}
                                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                        className="h-32"
                                        placeholder="Experience with react&#10;Good communication skills"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? 'Saving...' : editingId ? 'Update Position' : 'Create Position'}
                        </Button>
                    </form>
                </Card>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {positions.map((pos) => (
                            <tr key={pos._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm font-medium text-gray-900">{pos.title}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant="secondary">{pos.type}</Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {pos.isOpen ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Open
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Closed
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(pos)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(pos._id)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {positions.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No positions found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
