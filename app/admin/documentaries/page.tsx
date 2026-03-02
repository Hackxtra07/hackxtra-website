'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

import { Film, Tag, Calendar, Hash, Upload, Plus, Trash2, Edit2, Loader2, Sparkles, Clock, Globe, ExternalLink, Play, Info } from 'lucide-react';

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
        videoLink: data.url || url,
        thumbnail: data.image || '',
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
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-white tracking-tighter">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-110 duration-500">
              <Film className="h-8 w-8" />
            </div>
            Cinema Archive
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Oversee the operative network's visual intelligence and historical documentary bank.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
          <Button
            onClick={() => {
              const url = prompt("Enter Intelligence Feed URI (YouTube):");
              if (url) importFromUrl(url);
            }}
            variant="outline"
            className="h-12 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white px-6 font-black uppercase tracking-[0.2em] text-[10px]"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Extract Metadata
          </Button>
          <Button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className={`h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-indigo-600 border-indigo-400/30 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
          >
            {showForm ? 'Abort Entry' : 'Manual Manifest'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Core Blueprint</h3>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Archive Designation</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white placeholder:text-gray-700"
                      placeholder="History of Information Warfare..."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Visual Asset URI (Thumbnail)</Label>
                    <Input
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white"
                      placeholder="https://images.operative.net/poster.jpg"
                    />
                    {formData.thumbnail && (
                      <div className="mt-2 relative aspect-video w-48 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                        <img
                          src={formData.thumbnail}
                          alt="Manifest Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Operational Summary</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4"
                      placeholder="Detailed intelligence briefing on this visual asset..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Signal Parameters</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Classification Area</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white"
                      placeholder="Cybersecurity"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Broadcast Date</Label>
                    <Input
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white invert-calendar-icon"
                      required
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Signal Source URI (Video Link)</Label>
                    <Input
                      value={formData.videoLink}
                      onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white"
                      placeholder="https://video-hub.operative.net/archive-0394"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Intelligence Runtime</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white"
                      placeholder="e.g. 45 mins"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Signal Tags</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white"
                      placeholder="hacking, security, leak"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Operational Integrity</p>
                    <p className="text-[9px] text-gray-500 leading-tight">All visual intelligence must be verified by the high command before manual entry.</p>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 border border-indigo-400/20" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                  Synchronizing Intelligence...
                </div>
              ) : editingId ? (
                <div className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4" /> Finalize Manifest Update
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Upload New Intelligence
                </div>
              )}
            </Button>
          </form>
        </Card>
      )}

      {loading && !documentaries.length ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-mono text-sm animate-pulse">Decrypting Cinema Vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {documentaries.map((doc) => (
            <Card key={doc._id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md group hover:border-indigo-500/30 hover:bg-white/[0.08] transition-all duration-500 flex flex-col relative rounded-[2rem]">
              <div className="aspect-[16/10] relative overflow-hidden bg-white/5">
                {doc.thumbnail ? (
                  <img src={doc.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={doc.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 border-b border-white/5">
                    <Film className="h-12 w-12 text-gray-800 opacity-20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="h-14 w-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-500/40 backdrop-blur-sm border border-indigo-400/30 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                    <Play className="h-6 w-6 ml-1 fill-current" />
                  </div>
                </div>

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400 shadow-lg bg-black/60 border border-indigo-500/30 backdrop-blur-md">
                    {doc.category}
                  </span>
                </div>

                {doc.duration && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-[9px] font-black text-white px-2 py-1 rounded-md border border-white/10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg">
                    <Clock className="h-3 w-3 text-indigo-500" />
                    {doc.duration}
                  </div>
                )}
              </div>

              <div className="p-7 flex-1 flex flex-col relative">
                <h3 className="font-black text-white text-lg line-clamp-2 leading-tight tracking-tight group-hover:text-indigo-400 transition-colors uppercase mb-3">{doc.title}</h3>

                <p className="text-gray-400 text-[11px] mb-8 line-clamp-3 leading-relaxed opacity-70 font-medium italic">"{doc.description}"</p>

                <div className="mt-auto space-y-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-600 border-b border-white/5 pb-2">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-indigo-500" /> Broadcast</span>
                      <span className="text-gray-400 font-mono">{new Date(doc.releaseDate).toLocaleDateString()}</span>
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {doc.tags.slice(0, 4).map((tag, i) => (
                          <span key={i} className="text-[8px] font-black uppercase tracking-tighter bg-white/5 text-gray-500 px-2 py-0.5 rounded-md border border-white/5 hover:border-indigo-500/30 hover:text-indigo-400 transition-all cursor-default flex items-center gap-1">
                            <Hash className="h-2 w-2" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(doc)}
                      className="flex-1 bg-white/5 hover:bg-indigo-600 text-gray-400 hover:text-white border border-white/10 hover:border-indigo-400/30 text-[9px] font-black uppercase tracking-widest h-10 transition-all duration-300"
                    >
                      <Edit2 className="mr-2 h-3.5 w-3.5" /> Recalibrate
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => handleDelete(doc._id)}
                      variant="ghost"
                      className="w-10 h-10 text-gray-600 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all rounded-xl"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {documentaries.length === 0 && !loading && (
            <div className="col-span-full py-24 text-center flex flex-col items-center gap-6 bg-white/5 border border-white/10 rounded-[4rem]">
              <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center">
                <Film className="h-10 w-10 text-gray-800 opacity-20" />
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Archive Registry Empty</p>
                <p className="text-gray-600 font-medium text-[10px] max-w-xs">No visual intelligence detected in the cinema vault. Begin a new manual manifest to populate the grid.</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-8 rounded-full text-[9px] font-black uppercase tracking-widest h-10 mt-2"
              >
                Initialize First Entry
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
