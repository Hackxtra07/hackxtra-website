'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateNewsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        author: 'Admin', // Default to Admin, could be dynamic based on logged in user
        tags: '',
        isPublished: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isPublished: checked }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            // Convert comma-separated tags to array
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            const payload = {
                ...formData,
                tags: tagsArray,
                publishedAt: formData.isPublished ? new Date() : null
            };

            const response = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('News article created successfully');
                router.push('/admin/news');
            } else {
                toast.error(data.error || 'Failed to create news article');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const importFromUrl = async () => {
        const url = prompt("Enter News URL:");
        if (!url) return;

        try {
            toast.loading("Fetching metadata...");
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            toast.dismiss();

            if (data.error) {
                toast.error(data.error);
                return;
            }

            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                content: prev.content || data.description || '', // Use description as initial content
                image: data.image || prev.image,
            }));
            toast.success("Imported metadata!");
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to import");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/news">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Create News Article</h1>
                </div>
                <Button onClick={importFromUrl} variant="outline">
                    Import from URL
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Article Title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="author">Author</Label>
                        <Input
                            id="author"
                            name="author"
                            placeholder="Author Name"
                            value={formData.author}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Cover Image URL</Label>
                        <Input
                            id="image"
                            name="image"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            name="tags"
                            placeholder="Cybersecurity, AI, update"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Write your article content here..."
                            className="min-h-[300px]"
                            value={formData.content}
                            onChange={handleChange}
                            required
                        />
                        <p className="text-xs text-muted-foreground">You can use Markdown or HTML (sanitize carefully if HTML).</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="isPublished" checked={formData.isPublished} onCheckedChange={handleSwitchChange} />
                        <Label htmlFor="isPublished">Publish immediately</Label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Article
                    </Button>
                </div>
            </form>
        </div>
    );
}
