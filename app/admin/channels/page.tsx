'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import {
  Radio, Plus, Search, Edit2, Trash2, Loader2, Signal,
  Wifi, Activity, Globe, Shield, Zap, Target, Layers,
  ChevronRight, X, AlertCircle, Database, Network
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Channel {
  _id: string;
  name: string;
  members: number;
  description?: string;
}

export default function AdminChannelsPage() {
  const { request, loading } = useApi();
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    members: 0,
    description: ''
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const data = await request('/api/channels');
      setChannels(data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch signal spectrum', variant: 'destructive' });
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
        toast({ title: 'Success', description: 'Frequency shifted successfully!' });
      } else {
        await request('/api/channels', {
          method: 'POST',
          body: formData,
        });
        toast({ title: 'Success', description: 'New frequency broadcasted!' });
      }
      resetForm();
      fetchChannels();
    } catch (error) {
      toast({ title: 'Error', description: 'Signal interference detected', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this frequency?')) return;
    try {
      await request(`/api/channels/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Signal terminated!' });
      fetchChannels();
    } catch (error) {
      toast({ title: 'Error', description: 'Termination failed', variant: 'destructive' });
    }
  };

  const handleEdit = (channel: Channel) => {
    setFormData({
      name: channel.name,
      members: channel.members,
      description: channel.description || ''
    });
    setEditingId(channel._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', members: 0, description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-50 pointer-events-none" />
        <div className="relative z-10 text-left">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter uppercase">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-110 duration-500">
              <Radio className="h-8 w-8" />
            </div>
            Frequency Broadcasts
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Coordinate the network spectrum and oversee active communication nodes.</p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto relative z-10">
          <Button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className={`h-14 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border flex-1 lg:flex-none ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-emerald-600 border-emerald-400/30 text-white hover:bg-emerald-500 shadow-emerald-500/20'}`}
          >
            {showForm ? 'Abort Frequency Shift' : <><Plus className="mr-2 h-4 w-4" /> Instantiate Node</>}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative rounded-[2.5rem]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Signal Parameters</h3>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Node Designation</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                      placeholder="e.g. CORE_NETWORK_ALPHA"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Signal Strength (Initial Members)</Label>
                    <Input
                      type="number"
                      value={formData.members}
                      onChange={(e) => setFormData({ ...formData, members: parseInt(e.target.value) })}
                      className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-14 text-white font-mono rounded-2xl"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Node Description</h3>
                </div>

                <div className="grid gap-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Broadcast Intent</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4 placeholder:text-gray-700 rounded-2xl outline-none"
                    placeholder="Detail the technical focus and operational protocols of this node..."
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20 border border-emerald-400/20 rounded-2xl" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                  Synchronizing Grid...
                </div>
              ) : editingId ? (
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5" /> Execute Frequency Shift
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5" /> Broadcast New Signal
                </div>
              )}
            </Button>
          </form>
        </Card>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden relative group/table shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover/table:opacity-100 transition-opacity duration-700" />

        <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Spectrum Monitoring</h2>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse relative z-10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Node designation</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Signal Strength</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(channels || []).map((channel) => (
                <tr key={channel._id} className="hover:bg-white/[0.02] transition-colors group/row">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-5 text-left">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg group-hover/row:scale-105 transition-transform duration-500 relative">
                        <Radio size={20} />
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover/row:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black text-white uppercase tracking-tight group-hover/row:text-emerald-400 transition-colors">#{channel.name}</span>
                        <span className="text-[10px] text-zinc-500 leading-none mt-1 line-clamp-1 italic max-w-xs group-hover/row:text-zinc-400 transition-colors">"{channel.description || 'Global broadcast node...'}"</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 whitespace-nowrap text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-2xl font-mono font-black text-white group-hover:text-emerald-400 transition-colors leading-none">{channel.members.toLocaleString()}</span>
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">OPERATIVES</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-3 translate-x-4 group-hover/row:translate-x-0 opacity-0 group-hover/row:opacity-100 transition-all duration-500">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(channel)}
                        className="h-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest px-4"
                      >
                        <Edit2 className="mr-2 h-3.5 w-3.5" /> Shift
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleDelete(channel._id)}
                        className="h-10 w-10 bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!channels || channels.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30">
                      <Signal size={48} className="text-zinc-700" />
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">No active frequencies detected in the spectrum.</p>
                        <p className="text-[8px] font-mono text-zinc-800 tracking-widest uppercase">Initializing broadcast protocols...</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center flex justify-between items-center relative z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 italic flex items-center gap-2">
            <AlertCircle size={12} className="text-zinc-800" />
            Authorized transmission only. Signals are encrypted.
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">Displaying {channels?.length || 0} broadcast nodes</p>
        </div>
      </div>

      <div className="flex justify-center flex-col items-center gap-4 opacity-40">
        <Globe size={24} className="text-zinc-700" />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 text-center italic">"The signal must never break. The network is the weapon."</p>
      </div>
    </div>
  );
}
