'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface NewsItem {
    _id: string;
    title: string;
    author: string;
    isPublished: boolean;
    publishedAt: string;
    createdAt: string;
}

export default function NewsAdminPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            // Adding ?admin=true so API knows to return all, even unpublished
            const response = await fetch('/api/news?admin=true', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setNews(data.data);
            } else {
                toast.error(data.error || 'Failed to fetch news');
            }
        } catch (error) {
            toast.error('Failed to fetch news');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news article?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/news/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                toast.success('News article deleted');
                fetchNews();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Failed to delete news article');
        }
    };

    const togglePublish = async (item: NewsItem) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/news/${item._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isPublished: !item.isPublished,
                    publishedAt: !item.isPublished ? new Date() : item.publishedAt
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Article ${!item.isPublished ? 'published' : 'unpublished'}`);
                fetchNews();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    }

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/cron/news', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`News refreshed: ${data.data.count} new articles`);
                fetchNews(); // Reload list
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Failed to refresh news');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">News Management</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Refreshing...' : 'Auto-Refresh Daily News'}
                    </Button>
                    <Link href="/admin/news/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add News
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-md shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Author
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {news.map((item) => (
                            <tr key={item._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{item.author}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isPublished
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {item.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => togglePublish(item)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                        title={item.isPublished ? "Unpublish" : "Publish"}
                                    >
                                        {item.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    <Link href={`/admin/news/${item._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block">
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {news.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No news articles found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
