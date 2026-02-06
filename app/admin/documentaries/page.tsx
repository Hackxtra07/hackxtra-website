'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface Documentary {
  _id: string;
  title: string;
  description: string;
  videoLink: string;
  duration?: string;
  releaseDate: string;
  category: string;
  tags: string[];
  thumbnail?: string;
}

export default function AdminDocumentariesPage() {
  const { request, loading } = useApi();
  const { toast } = useToast();
  const [documentaries, setDocumentaries] = useState<Documentary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoLink: '',
    duration: '',
    releaseDate: new Date().toISOString().split('T')[0],
    category: '',
    tags: '',
    thumbnail: '',
  });

  useEffect(() => {
    fetchDocumentaries();
  }, []);

  const fetchDocumentaries = async () => {
    try {
      const data = await request('/api/documentaries');
      setDocumentaries(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch documentaries', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...formData,
        releaseDate: new Date(formData.releaseDate).toISOString(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      if (editingId) {
        await request(`/api/documentaries/${editingId}`, {
          method: 'PUT',
          body,
        });
        toast({ title: 'Success', description: 'Documentary updated!' });
      } else {
        await request('/api/documentaries', {
          method: 'POST',
          body,
        });
        toast({ title: 'Success', description: 'Documentary created!' });
      }
      resetForm();
      fetchDocumentaries();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save documentary', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await request(`/api/documentaries/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Documentary deleted!' });
      fetchDocumentaries();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete documentary', variant: 'destructive' });
    }
  };

  const handleEdit = (doc: Documentary) => {
    setFormData({
      title: doc.title,
      description: doc.description,
      videoLink: doc.videoLink,
      duration: doc.duration || '',
      releaseDate: new Date(doc.releaseDate).toISOString().split('T')[0],
      category: doc.category,
      tags: doc.tags.join(', '),
      thumbnail: doc.thumbnail || '',
    });
    setEditingId(doc._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoLink: '',
      duration: '',
      releaseDate: new Date().toISOString().split('T')[0],
      category: '',
      tags: '',
      thumbnail: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documentaries Management</h1>
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Documentary'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Thumbnail URL (for posters)</Label>
              <Input
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="/images/poster.png or https://..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Cybersecurity"
                  required
                />
              </div>
              <div>
                <Label>Release Date</Label>
                <Input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Video Link</Label>
              <Input
                value={formData.videoLink}
                onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <Label>Duration</Label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 45 mins"
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="security, hacking, tutorial"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Documentary' : 'Create Documentary'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentaries.map((doc) => (
          <Card key={doc._id} className="p-4">
            <h3 className="font-bold text-lg mb-2">{doc.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{doc.description.substring(0, 100)}...</p>
            <div className="space-y-1 text-sm mb-4">
              <p><strong>Category:</strong> {doc.category}</p>
              <p><strong>Release Date:</strong> {new Date(doc.releaseDate).toLocaleDateString()}</p>
              {doc.duration && <p><strong>Duration:</strong> {doc.duration}</p>}
              {doc.tags.length > 0 && <p><strong>Tags:</strong> {doc.tags.join(', ')}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(doc)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(doc._id)}
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
