'use client';

import { useState, useEffect } from 'react';
import { Beaker, FlaskConical, Microscope, Activity, Clock, Layers, Zap, Plus, Search, Shield, Target, Trash2, Edit, Loader2, Sparkles, Globe, Terminal, Info, ChevronRight, Layout, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

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
  coverImage?: string;
  isPremium: boolean;
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
    coverImage: '',
    isPremium: false,
  });

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const data = await request('/api/labs?admin=true');
      setLabs(data.labs || data || []);
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
        coverImage: data.image || '',
        isPremium: false,
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
        objectives: formData.objectives.split('\n').filter((o: string) => o.trim()),
        tools: formData.tools.split('\n').filter((t: string) => t.trim()),
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
      coverImage: lab.coverImage || '',
      isPremium: lab.isPremium || false,
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
      coverImage: '',
      isPremium: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-110 duration-500">
              <FlaskConical className="h-8 w-8" />
            </div>
            Biohazard Labs
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Orchestrate virtual security sandboxes and elite experimentation vectors.</p>
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto relative z-10">
          <Button
            onClick={() => {
              const url = prompt("Enter Lab URL:");
              if (url) importFromUrl(url);
            }}
            className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex-1 lg:flex-none"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Globe className="mr-2 h-4 w-4" /> Import Meta</>}
          </Button>
          <Button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className={`h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border flex-1 lg:flex-none ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-indigo-600 border-indigo-400/30 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
          >
            {showForm ? 'Abort Setup' : <><Plus className="mr-2 h-4 w-4" /> New Sandbox</>}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative rounded-[2.5rem]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Environment Config</h3>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Laboratory Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                      placeholder="e.g. KERNEL EXPLOITATION REFINERY"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Laboratory manifest</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4 placeholder:text-gray-700 rounded-2xl"
                      placeholder="Define the experimental parameters..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Operational Category</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl text-xs uppercase font-black tracking-widest"
                        placeholder="e.g. WEB SECURITY"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Volatility Tier</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                        <SelectTrigger className={`bg-black/40 border-white/10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest ${formData.difficulty === 'Easy' ? 'text-emerald-400' : formData.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          <SelectItem value="Easy" className="text-emerald-400">Easy</SelectItem>
                          <SelectItem value="Medium" className="text-amber-400">Medium</SelectItem>
                          <SelectItem value="Hard" className="text-rose-400">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Chronometer (Minutes)</Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                        <Input
                          type="number"
                          value={formData.timeToComplete}
                          onChange={(e) => setFormData({ ...formData, timeToComplete: parseInt(e.target.value) })}
                          className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 pl-12 text-white font-mono rounded-2xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="isPremium" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-pointer">PRO Restricted</Label>
                        <p className="text-[8px] text-zinc-600 font-medium">Enable for elite operatives only.</p>
                      </div>
                      <Switch
                        id="isPremium"
                        checked={formData.isPremium}
                        onCheckedChange={(val) => setFormData({ ...formData, isPremium: val })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Asset & Target Mapping</h3>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Laboratory visual (URL)</Label>
                    <div className="flex gap-3">
                      <Input
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 text-white placeholder:text-zinc-800 rounded-2xl flex-1"
                        placeholder="https://visual-grid.com/asset-1.jpg"
                      />
                      {formData.coverImage && (
                        <div className="h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-black shrink-0 relative group/preview">
                          <img src={formData.coverImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Layout size={12} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Environment access (URL)</Label>
                    <Input
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 text-white placeholder:text-zinc-800 rounded-2xl"
                      placeholder="https://labs.operative.grid/exec-node"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Experimental Objectives</Label>
                      <Textarea
                        value={formData.objectives}
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                        placeholder="NODE BREACH&#10;DATA EXTRACTION"
                        className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-40 text-white text-[10px] font-black uppercase tracking-widest leading-relaxed resize-none p-4 placeholder:text-zinc-800 rounded-2xl"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Weaponry & Frameworks</Label>
                      <Textarea
                        value={formData.tools}
                        onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                        placeholder="METASPLOIT&#10;WIRESHARK"
                        className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-40 text-white text-[10px] font-black uppercase tracking-widest leading-relaxed resize-none p-4 placeholder:text-zinc-800 rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-16 bg-gradient-to-r from-indigo-600 top-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-500/20 border border-indigo-400/20 rounded-2xl" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                  Synchronizing Lab Core...
                </div>
              ) : editingId ? (
                <div className="flex items-center gap-3">
                  <Settings2 className="h-5 w-5" /> Reconfigure Lab Topology
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5" /> Initialize Biohazard Sandbox
                </div>
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* Labs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {labs?.map((lab: Lab) => (
          <Card key={lab._id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl group hover:border-indigo-500/40 transition-all duration-700 flex flex-col rounded-[2.5rem] p-1 relative">
            <div className="aspect-video relative overflow-hidden rounded-[2.2rem] bg-black/40">
              {lab.coverImage ? (
                <img src={lab.coverImage} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-[2s] opacity-60 group-hover:opacity-100" alt={lab.title} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Microscope className="h-10 w-10 text-zinc-900 group-hover:text-indigo-500 transition-colors" />
                  <div className="h-px w-8 bg-zinc-900" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg border backdrop-blur-md ${lab.difficulty === 'Easy' ? 'bg-emerald-500/20 border-emerald-500/40' :
                  lab.difficulty === 'Medium' ? 'bg-amber-500/20 border-amber-500/40' :
                    'bg-rose-500/20 border-rose-500/40'
                  }`}>
                  {lab.difficulty}
                </span>
                {lab.isPremium && (
                  <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#0d0f1a] shadow-lg bg-yellow-400 border border-yellow-500 shadow-yellow-500/20">
                    ELITE_PRO
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 backdrop-blur-md">
                  <Activity size={10} className="animate-pulse" />
                  {lab.category.toUpperCase()}
                </div>
                <div className="text-[10px] font-mono text-white/50 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                  <Clock size={12} className="text-zinc-400" />
                  {lab.timeToComplete} MIN
                </div>
              </div>
            </div>

            <div className="p-8 pb-4 flex-1 flex flex-col relative">
              <h3 className="text-lg font-black text-white mb-2 line-clamp-2 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{lab.title}</h3>
              <p className="text-zinc-500 text-xs mb-8 line-clamp-3 leading-relaxed font-medium">
                {lab.description || "No transmission manifest provided for this experimental vector."}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                  <Target size={12} className="text-indigo-500/40" />
                  Targeting: <span className="text-zinc-400">{lab.category}</span>
                </div>

                <div className="flex gap-2 pb-6 pt-4 border-t border-white/5">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(lab)}
                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Edit className="mr-2 h-4 w-4" /> RECONFIGURE
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => handleDelete(lab._id)}
                    className="h-12 w-12 bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-2xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity p-10">
              <Beaker size={140} />
            </div>
          </Card>
        ))}
      </div>

      {labs.length === 0 && (
        <div className="py-32 flex flex-col items-center gap-6 opacity-30 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
          <Layers className="h-16 w-16 text-zinc-700" />
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">No experimental sandboxes detected in the Biohazard Grid.</p>
            <p className="text-[8px] font-mono text-zinc-800 tracking-widest uppercase">Initializing empty environment protocols...</p>
          </div>
        </div>
      )}
    </div>
  );
}
