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

interface Lab {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  objectives: string[];
  tools: string[];
  timeToComplete: number;
  url?: string;
}

export default function AdminLabsPage() {
  const { request, loading } = useApi();
  const { toast } = useToast();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    category: '',
    objectives: '',
    tools: '',
    timeToComplete: 60,
    url: '',
  });

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const data = await request('/api/labs');
      setLabs(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch labs', variant: 'destructive' });
    }
  };

  const importFromUrl = async (url: string) => {
    try {
      toast({ title: 'Importing...', description: 'Fetching metadata...' });
      const data = await request('/api/admin/scrape', {
        method: 'POST',
        body: { url }
      });

      setFormData({
        ...formData,
        title: data.title || '',
        description: data.description || '',
        url: data.url || url,
      });
      setShowForm(true);
      toast({ title: 'Success', description: 'Metadata imported!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to import', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...formData,
        objectives: formData.objectives.split('\n').filter(o => o.trim()),
        tools: formData.tools.split('\n').filter(t => t.trim()),
      };

      if (editingId) {
        await request(`/api/labs/${editingId}`, {
          method: 'PUT',
          body,
        });
        toast({ title: 'Success', description: 'Lab updated!' });
      } else {
        await request('/api/labs', {
          method: 'POST',
          body,
        });
        toast({ title: 'Success', description: 'Lab created!' });
      }
      resetForm();
      fetchLabs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save lab', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await request(`/api/labs/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Lab deleted!' });
      fetchLabs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete lab', variant: 'destructive' });
    }
  };

  const handleEdit = (lab: Lab) => {
    setFormData({
      title: lab.title,
      description: lab.description,
      difficulty: lab.difficulty,
      category: lab.category,
      objectives: lab.objectives.join('\n'),
      tools: lab.tools.join('\n'),
      timeToComplete: lab.timeToComplete,
      url: lab.url || '',
    });
    setEditingId(lab._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'Medium',
      category: '',
      objectives: '',
      tools: '',
      timeToComplete: 60,
      url: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Labs Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const url = prompt("Enter Lab URL:");
              if (url) importFromUrl(url);
            }}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import from URL'}
          </Button>
          <Button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add New Lab'}
          </Button>
        </div>
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
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Network Security"
                  required
                />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Time to Complete (minutes)</Label>
              <Input
                type="number"
                value={formData.timeToComplete}
                onChange={(e) => setFormData({ ...formData, timeToComplete: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Lab URL</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g., https://labs.example.com/lab-1"
              />
            </div>
            <div>
              <Label>Objectives (one per line)</Label>
              <Textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="Understand basic networking&#10;Configure firewall rules"
              />
            </div>
            <div>
              <Label>Tools (one per line)</Label>
              <Textarea
                value={formData.tools}
                onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                placeholder="Wireshark&#10;Nmap&#10;tcpdump"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Lab' : 'Create Lab'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {labs.map((lab) => (
          <Card key={lab._id} className="p-4">
            <h3 className="font-bold text-lg mb-2">{lab.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{lab.description.substring(0, 100)}...</p>
            <div className="space-y-1 text-sm mb-4">
              <p><strong>Category:</strong> {lab.category}</p>
              <p><strong>Difficulty:</strong> <span className={`px-2 py-1 rounded text-white ${lab.difficulty === 'Easy' ? 'bg-green-500' : lab.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>{lab.difficulty}</span></p>
              <p><strong>Time:</strong> {lab.timeToComplete} minutes</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(lab)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(lab._id)}
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
