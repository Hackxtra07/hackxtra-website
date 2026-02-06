'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  category: string;
  tags: string[];
}

export default function AdminResourcesPage() {
  const { request, loading } = useApi();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Link',
    url: '',
    category: '',
    tags: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await request('/api/resources');
      setResources(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch resources', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      if (editingId) {
        await request(`/api/resources/${editingId}`, {
          method: 'PUT',
          body,
        });
        toast({ title: 'Success', description: 'Resource updated!' });
      } else {
        await request('/api/resources', {
          method: 'POST',
          body,
        });
        toast({ title: 'Success', description: 'Resource created!' });
      }
      resetForm();
      fetchResources();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save resource', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await request(`/api/resources/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Resource deleted!' });
      fetchResources();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete resource', variant: 'destructive' });
    }
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url,
      category: resource.category,
      tags: resource.tags.join(', '),
    });
    setEditingId(resource._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Link',
      url: '',
      category: '',
      tags: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resources Management</h1>
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Resource'}
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
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Link">Link</SelectItem>
                    <SelectItem value="Document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Security Tools"
                  required
                />
              </div>
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="security, hacking, tools"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Resource' : 'Create Resource'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <Card key={resource._id} className="p-4">
            <h3 className="font-bold text-lg mb-2">{resource.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{resource.description.substring(0, 80)}...</p>
            <div className="space-y-1 text-sm mb-4">
              <p><strong>Type:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{resource.type}</span></p>
              <p><strong>Category:</strong> {resource.category}</p>
              {resource.tags.length > 0 && <p><strong>Tags:</strong> {resource.tags.join(', ')}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(resource)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(resource._id)}
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
