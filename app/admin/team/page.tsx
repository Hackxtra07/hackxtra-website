'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Users, UserPlus, Shield, Globe, Mail, Github, Twitter, Linkedin,
  ExternalLink, Activity, Fingerprint, Trash2, Edit2, Loader2, Sparkles,
  Search, Info, ChevronRight, X, Contact, Plus
} from 'lucide-react';

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
      const res = await request('/api/team');
      setMembers(res.data || res || []);
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
        toast({ title: 'Success', description: 'Operative profile updated!' });
      } else {
        await request('/api/team', {
          method: 'POST',
          body,
        });
        toast({ title: 'Success', description: 'New operative deployed!' });
      }
      resetForm();
      fetchMembers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save operative data', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this operative?')) return;
    try {
      await request(`/api/team/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Operative decommissioned!' });
      fetchMembers();
    } catch (error) {
      toast({ title: 'Error', description: 'Decommissioning failed', variant: 'destructive' });
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
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
            <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
              <Users className="h-8 w-8" />
            </div>
            Tactical Unit
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Oversee operative assignments, clearance levels, and mission profiles.</p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto relative z-10">
          <Button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className={`h-14 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border flex-1 lg:flex-none ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-blue-600 border-blue-400/30 text-white hover:bg-blue-500 shadow-blue-500/20'}`}
          >
            {showForm ? 'Cancel Deployment' : <><UserPlus className="mr-2 h-4 w-4" /> Deploy New Operative</>}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative rounded-[2.5rem]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Personnel Identity</h3>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Full Operative Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                      placeholder="e.g. ALEX 'VAPOR' VANCE"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Mission Role</Label>
                      <Input
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                        placeholder="e.g. Lead Penetration Expert"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Comms Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                        placeholder="operative@hackxtras.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Mission Profile (Bio)</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4 placeholder:text-gray-700 rounded-2xl"
                      placeholder="Detail the operative's background and technical expertise..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Tactical Links & Intel</h3>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Avatar URI (Image URL)</Label>
                    <div className="flex gap-4">
                      <Input
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl flex-1"
                        placeholder="https://visuals.net/pfp-01.jpg"
                      />
                      {formData.image && (
                        <div className="h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-black shrink-0 relative group/pfp">
                          <img src={formData.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Fingerprint size={12} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Twitter Handle</Label>
                      <Input
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl text-[10px]"
                        placeholder="@codename"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">LinkedIn URI</Label>
                      <Input
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl text-[10px]"
                        placeholder="linkedin.com/..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">GitHub URI</Label>
                      <Input
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl text-[10px]"
                        placeholder="github.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-blue-500/10 bg-black/20 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Declassification Policy</p>
                    <p className="text-[9px] text-gray-500 leading-tight">Profiles are public and visible to all authorized operatives in the dashboard.</p>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 border border-blue-400/20 rounded-2xl" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                  Encrypting Profile...
                </div>
              ) : editingId ? (
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5" /> Re-authorize Operative Profile
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5" /> Execute New Deployment
                </div>
              )}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member) => (
          <Card key={member._id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl group hover:border-blue-500/40 transition-all duration-700 flex flex-col rounded-[2.5rem] p-1 relative">
            <div className="p-8 pb-4 flex-1 flex flex-col relative">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group/avatar">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-2xl shadow-xl shadow-blue-500/10 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                    {member.image ? (
                      <img src={member.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                    ) : (
                      member.name.substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center">
                    <Activity size={10} className="text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors truncate">{member.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-400/70 bg-blue-500/5 px-2 py-1 rounded-lg border border-blue-500/10 uppercase tracking-widest mt-1">
                    <Shield size={10} />
                    {member.role}
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-8 flex-1">
                <div className="relative">
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4 font-medium italic relative z-10">
                    "{member.bio}"
                  </p>
                  <div className="absolute -left-4 -top-2 text-4xl text-white/5 font-serif pointer-events-none">"</div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Secure Comms</span>
                    <span className="text-[10px] text-zinc-300 font-mono truncate max-w-[150px]">{member.email}</span>
                  </div>
                  <div className="flex gap-3">
                    {member.socialLinks?.twitter && (
                      <a href={`https://twitter.com/${member.socialLinks.twitter}`} target="_blank" className="h-8 w-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                        <Twitter size={14} />
                      </a>
                    )}
                    {member.socialLinks?.github && (
                      <a href={`https://github.com/${member.socialLinks.github}`} target="_blank" className="h-8 w-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                        <Github size={14} />
                      </a>
                    )}
                    {member.socialLinks?.linkedin && (
                      <a href={`https://linkedin.com/in/${member.socialLinks.linkedin}`} target="_blank" className="h-8 w-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                        <Linkedin size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-white/5 mt-auto">
                <Button
                  size="sm"
                  onClick={() => handleEdit(member)}
                  className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Recalibrate
                </Button>
                <Button
                  size="icon"
                  onClick={() => handleDelete(member._id)}
                  className="h-12 w-12 bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-2xl transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity p-10">
              <Fingerprint size={140} />
            </div>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="py-32 flex flex-col items-center gap-6 opacity-30 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
          <Contact className="h-16 w-16 text-zinc-700" />
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">No tactical personnel detected in the Unit Cluster.</p>
            <p className="text-[8px] font-mono text-zinc-800 tracking-widest uppercase">Initializing empty personnel protocols...</p>
          </div>
        </div>
      )}
    </div>
  );
}
