'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  email: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function AdminTeamPage() {
  const { request, loading } = useApi();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    email: '',
    twitter: '',
    linkedin: '',
    github: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await request('/api/team');
      setMembers(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch team members', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        image: formData.image,
        email: formData.email,
        socialLinks: {
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          github: formData.github,
        },
      };

      if (editingId) {
        await request(`/api/team/${editingId}`, {
          method: 'PUT',
          body,
        });
        toast({ title: 'Success', description: 'Team member updated!' });
      } else {
        await request('/api/team', {
          method: 'POST',
          body,
        });
        toast({ title: 'Success', description: 'Team member created!' });
      }
      resetForm();
      fetchMembers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save team member', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await request(`/api/team/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Team member deleted!' });
      fetchMembers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete team member', variant: 'destructive' });
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image: member.image || '',
      email: member.email,
      twitter: member.socialLinks?.twitter || '',
      linkedin: member.socialLinks?.linkedin || '',
      github: member.socialLinks?.github || '',
    });
    setEditingId(member._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      bio: '',
      image: '',
      email: '',
      twitter: '',
      linkedin: '',
      github: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Members Management</h1>
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Member'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Security Expert"
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
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Twitter</Label>
                <Input
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/..."
                />
              </div>
              <div>
                <Label>GitHub</Label>
                <Input
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="github.com/..."
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Member' : 'Create Member'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <Card key={member._id} className="p-4">
            <h3 className="font-bold text-lg mb-1">{member.name}</h3>
            <p className="text-blue-600 text-sm mb-2">{member.role}</p>
            <p className="text-gray-600 text-sm mb-2">{member.bio.substring(0, 80)}...</p>
            <p className="text-sm text-gray-500 mb-4">{member.email}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(member)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(member._id)}
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
