'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SocialLinks {
    twitter?: string;
    github?: string;
    linkedin?: string;
}

interface User {
    _id: string;
    username: string;
    email: string;
    points: number;
    badges: string[];
    country: string;
    role: 'user' | 'admin';
    bio?: string;
    socialLinks?: SocialLinks;
    avatarColor?: string;
    change?: 'up' | 'down' | 'same';
    isPro?: boolean;
    subscriptionExpiresAt?: string;
}

export default function AdminUsersPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        points: 0,
        badges: '',
        country: 'US',
        role: 'user',
        bio: '',
        twitter: '',
        github: '',
        linkedin: '',
        avatarColor: 'bg-blue-500/20 text-blue-500',
        change: 'same',
        password: '',
        isPro: false,
        subscriptionExpiresAt: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await request('/api/users');
            setUsers(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                username: formData.username,
                email: formData.email,
                points: Number(formData.points),
                badges: formData.badges.split(',').map(t => t.trim()).filter(t => t),
                country: formData.country,
                role: formData.role,
                bio: formData.bio,
                socialLinks: {
                    twitter: formData.twitter,
                    github: formData.github,
                    linkedin: formData.linkedin,
                },
                avatarColor: formData.avatarColor,
                change: formData.change,
                password: formData.password || undefined,
                isPro: formData.isPro,
                subscriptionExpiresAt: formData.subscriptionExpiresAt || undefined,
            };

            if (editingId) {
                await request(`/api/users/${editingId}`, {
                    method: 'PUT',
                    body,
                });
                toast({ title: 'Success', description: 'User updated!' });
            } else {
                await request('/api/users', {
                    method: 'POST',
                    body,
                });
                toast({ title: 'Success', description: 'User created!' });
            }
            resetForm();
            fetchUsers();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save user', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await request(`/api/users/${id}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'User deleted!' });
            fetchUsers();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
        }
    };

    const handleEdit = (user: User) => {
        setFormData({
            username: user.username,
            email: user.email,
            points: user.points,
            badges: user.badges.join(', '),
            country: user.country,
            role: user.role,
            bio: user.bio || '',
            twitter: user.socialLinks?.twitter || '',
            github: user.socialLinks?.github || '',
            linkedin: user.socialLinks?.linkedin || '',
            avatarColor: user.avatarColor || 'bg-blue-500/20 text-blue-500',
            change: (user.change as string) || 'same',
            password: '',
            isPro: user.isPro || false,
            subscriptionExpiresAt: user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toISOString().split('T')[0] : '',
        });
        setEditingId(user._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            points: 0,
            badges: '',
            country: 'US',
            role: 'user',
            bio: '',
            twitter: '',
            github: '',
            linkedin: '',
            avatarColor: 'bg-blue-500/20 text-blue-500',
            change: 'same',
            password: '',
            isPro: false,
            subscriptionExpiresAt: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Button
                    onClick={() => (showForm ? resetForm() : setShowForm(true))}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'Add New User'}
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 border-2 border-blue-100 shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Account Details</h3>
                                <div>
                                    <Label>Username</Label>
                                    <Input
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Password {editingId && '(Leave blank to keep current)'}</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingId}
                                        placeholder={editingId ? "Enter new password to reset" : "Enter password"}
                                        minLength={6}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Role</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(val: any) => setFormData({ ...formData, role: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Points</Label>
                                        <Input
                                            type="number"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isPro"
                                            checked={formData.isPro}
                                            onChange={(e) => setFormData({ ...formData, isPro: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600"
                                        />
                                        <Label htmlFor="isPro" className="font-semibold text-yellow-700">Pro Membership</Label>
                                    </div>

                                    {formData.isPro && (
                                        <div>
                                            <Label>Subscription Expiry</Label>
                                            <Input
                                                type="date"
                                                value={formData.subscriptionExpiresAt}
                                                onChange={(e) => setFormData({ ...formData, subscriptionExpiresAt: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Profile Info</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Country Code</Label>
                                        <Input
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            required
                                            maxLength={2}
                                            title="Two-letter country code (e.g. US)"
                                        />
                                    </div>
                                    <div>
                                        <Label>Badges</Label>
                                        <Input
                                            value={formData.badges}
                                            onChange={(e) => setFormData({ ...formData, badges: e.target.value })}
                                            placeholder="Elite, Hacker"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Bio</Label>
                                    <Textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="h-20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Twitter URL</Label>
                                    <Input
                                        value={formData.twitter}
                                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>GitHub URL</Label>
                                    <Input
                                        value={formData.github}
                                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>LinkedIn URL</Label>
                                    <Input
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
                        </Button>
                    </form>
                </Card>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${user.avatarColor || 'bg-gray-200'} flex items-center justify-center text-sm font-bold mr-4 text-white uppercase`}>
                                            {user.username.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                            <div className="text-xs text-gray-400">
                                                {user.country} • {user.socialLinks?.twitter ? '🐦' : ''} {user.socialLinks?.github ? '🐙' : ''}
                                                {user.isPro && <span className="ml-2 inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-400/20">PRO</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-gray-900">{user.points.toLocaleString()}</span>
                                    <span className="text-xs text-gray-500 ml-1">pts</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {user.badges.slice(0, 2).map((b, i) => (
                                            <span key={i} className="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {b}
                                            </span>
                                        ))}
                                        {user.badges.length > 2 && <span className="text-xs text-gray-500 self-center">+{user.badges.length - 2}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(user._id)}>Delete</Button>
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
