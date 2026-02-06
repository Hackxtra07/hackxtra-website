'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface Channel {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  link: string;
  category: string;
  followers: number;
}

export default function AdminChannelsPage() {
  const { request, loading } = useApi();
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    link: '',
    category: '',
    followers: 0,
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const data = await request('/api/channels');
      setChannels(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch channels', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await request(`/api/channels/${editingId}`, {
          method: 'PUT',
          body: formData,
        });
        toast({ title: 'Success', description: 'Channel updated!' });
      } else {
        await request('/api/channels', {
          method: 'POST',
          body: formData,
        });
        toast({ title: 'Success', description: 'Channel created!' });
      }
      resetForm();
      fetchChannels();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save channel', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await request(`/api/channels/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Channel deleted!' });
      fetchChannels();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete channel', variant: 'destructive' });
    }
  };

  const handleEdit = (channel: Channel) => {
    setFormData({
      name: channel.name,
      description: channel.description,
      icon: channel.icon || '',
      link: channel.link,
      category: channel.category,
      followers: channel.followers,
    });
    setEditingId(channel._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      link: '',
      category: '',
      followers: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Channels Management</h1>
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Channel'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Channel Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., YouTube Channel"
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
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Social Media"
                  required
                />
              </div>
              <div>
                <Label>Followers</Label>
                <Input
                  type="number"
                  value={formData.followers}
                  onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Link</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <Label>Icon URL</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="emoji or URL"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Channel' : 'Create Channel'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <Card key={channel._id} className="p-4">
            <div className="flex items-start gap-3">
              {channel.icon && <span className="text-3xl">{channel.icon}</span>}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{channel.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{channel.description.substring(0, 80)}...</p>
                <div className="space-y-1 text-sm mb-4">
                  <p><strong>Category:</strong> {channel.category}</p>
                  <p><strong>Followers:</strong> {channel.followers}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(channel)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(channel._id)}
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
