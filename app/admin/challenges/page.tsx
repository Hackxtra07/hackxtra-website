'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, ChevronRight, Eye } from "lucide-react";

interface Challenge {
    _id: string;
    title: string;
    description: string;
    points: number;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    type: 'quiz' | 'ctf';
    options?: string[];
    flag?: string;
}

export default function AdminChallengesPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        points: 50,
        category: 'Web',
        difficulty: 'Easy',
        flag: '',
        type: 'quiz',
        options: ['', '', '', ''],
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const data = await request('/api/challenges?admin=true');
            setChallenges(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch challenges', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate Quiz options
            if (formData.type === 'quiz') {
                if (formData.options.some(opt => !opt.trim())) {
                    toast({ title: 'Error', description: 'All 4 options are required for a quiz.', variant: 'destructive' });
                    return;
                }
                if (!formData.options.includes(formData.flag)) {
                    toast({ title: 'Error', description: 'The correct answer must be one of the options.', variant: 'destructive' });
                    return;
                }
            }

            if (editingId) {
                await request(`/api/challenges/${editingId}`, {
                    method: 'PUT',
                    body: formData,
                });
                toast({ title: 'Success', description: 'Challenge updated!' });
            } else {
                await request('/api/challenges', {
                    method: 'POST',
                    body: formData,
                });
                toast({ title: 'Success', description: 'Challenge created!' });
            }

            resetForm();
            fetchChallenges();
        } catch (error) {
            toast({ title: 'Error', description: editingId ? 'Failed to update challenge' : 'Failed to create challenge', variant: 'destructive' });
        }
    };

    const handleDeleteChallenge = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this challenge?")) return;
        try {
            await request(`/api/challenges/${id}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Challenge deleted!' });
            fetchChallenges();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete challenge', variant: 'destructive' });
        }
    };

    const handleEditChallenge = (challenge: Challenge) => {
        setFormData({
            title: challenge.title,
            description: challenge.description,
            points: challenge.points,
            category: challenge.category,
            difficulty: challenge.difficulty,
            flag: challenge.flag || '',
            type: challenge.type,
            options: challenge.options || ['', '', '', ''],
        });
        setEditingId(challenge._id);
        setShowForm(true);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            points: 50,
            category: 'Web',
            difficulty: 'Easy',
            flag: '',
            type: 'quiz',
            options: ['', '', '', ''],
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleAutoAdd = async () => {
        try {
            await request('/api/admin/challenges/auto-add', { method: 'POST' });
            toast({ title: 'Success', description: 'Added 10 challenges from the pool!' });
            fetchChallenges();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to auto-add challenges', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Challenge Management</h1>
                <div className="flex gap-2">
                    <Button
                        onClick={handleAutoAdd}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        disabled={loading}
                    >
                        Auto Add Challenges
                    </Button>
                    <Button
                        onClick={() => (showForm ? resetForm() : setShowForm(true))}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'Create Challenge'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quiz">Quiz (Multiple Choice)</SelectItem>
                                        <SelectItem value="ctf">CTF (Task & Flag)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
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

                        <div>
                            <Label>Description / Question</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        {formData.type === 'quiz' && (
                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                                <Label className="font-bold">Quiz Options</Label>
                                {formData.options.map((opt, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <span className="text-sm text-gray-500 w-6">{(i + 10).toString(36).toUpperCase()}.</span>
                                        <Input
                                            value={opt}
                                            onChange={(e) => handleOptionChange(i, e.target.value)}
                                            placeholder={`Option ${i + 1}`}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant={formData.flag === opt && opt !== '' ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, flag: opt })}
                                            className={formData.flag === opt && opt !== '' ? "bg-green-600" : ""}
                                        >
                                            {formData.flag === opt && opt !== '' ? "Correct Answer" : "Mark Correct"}
                                        </Button>
                                    </div>
                                ))}
                                <p className="text-xs text-muted-foreground mt-2">Click "Mark Correct" to select which option is the right answer.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Web">Web Exploitation</SelectItem>
                                        <SelectItem value="Crypto">Cryptography</SelectItem>
                                        <SelectItem value="Forensics">Forensics</SelectItem>
                                        <SelectItem value="General">General Knowledge</SelectItem>
                                        <SelectItem value="Misc">Miscellaneous</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Difficulty</Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(val) => setFormData({ ...formData, difficulty: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.type === 'ctf' && (
                                <div>
                                    <Label>Flag (Secret)</Label>
                                    <Input
                                        value={formData.flag}
                                        onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                                        placeholder="flag{...}"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Challenge' : 'Create Challenge')}
                        </Button>
                    </form>
                </Card>
            )}

            <div className="grid gap-4">
                {challenges.map((challenge) => (
                    <Card key={challenge._id} className="p-4 flex justify-between items-center group hover:border-blue-500/50 transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">
                                    {challenge.title}
                                </h3>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 uppercase text-gray-500 font-mono border">
                                    {challenge.type || 'CTF'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500 text-xs">
                                <span>{challenge.category}</span>
                                <span>•</span>
                                <span>{challenge.difficulty}</span>
                                <span>•</span>
                                <span className="text-blue-600 font-semibold">{challenge.points} pts</span>
                            </div>
                            {challenge.flag && (
                                <div className="mt-2 text-xs flex items-center gap-2 text-green-600 bg-green-50 px-2 py-1 rounded w-fit border border-green-100">
                                    <Eye className="h-3 w-3" />
                                    <span className="font-mono">Answer: {challenge.flag}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditChallenge(challenge)}
                            >
                                <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                                onClick={() => handleDeleteChallenge(challenge._id)}
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
