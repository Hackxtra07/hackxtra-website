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

import { Archive, Database, Upload, Plus, Trash2, Edit2, Loader2, Sparkles, FileText, Video as VideoIcon, ExternalLink, Globe, Tag, Info, Shield, Layers } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  category: string;
  tags: string[];
  coverImage?: string;
  isPremium: boolean;
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
    coverImage: '',
    isPremium: false,
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await request('/api/resources?admin=true');
      setResources(data.resources || data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch resources', variant: 'destructive' });
    }
  };

  const importFromUrl = async (url: string) => {
    try {
      toast({ title: 'Importing...', description: 'Fetching metadata from URL' });
      const data = await request('/api/admin/scrape', {
        method: 'POST',
        body: { url }
      });

      setFormData({
        ...formData,
        title: data.title || '',
        description: data.description || '',
        url: data.url || url,
        type: data.type || 'Link',
        category: '',
        tags: '',
        coverImage: data.image || '',
        isPremium: false,
      });
      setShowForm(true);
      toast({ title: 'Success', description: 'Metadata imported! Please review and save.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to import from URL', variant: 'destructive' });
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
      coverImage: resource.coverImage || '',
      isPremium: resource.isPremium || false,
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
      coverImage: '',
      isPremium: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-white tracking-tighter">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-110 duration-500">
              <Archive className="h-8 w-8" />
            </div>
            Data Repository
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Catalog and manage high-value technical assets, documentation, and external intelligence links.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
          <Button
            onClick={() => {
              const url = prompt("Enter Resource source URI (PDF, Drive, Blog):");
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
            className={`h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-emerald-600 border-emerald-400/30 text-white hover:bg-emerald-500 shadow-emerald-500/20'}`}
          >
            {showForm ? 'Abort Registry' : 'Manual Entry'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Resource Blueprint</h3>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Archive Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-12 text-white placeholder:text-gray-700"
                      placeholder="Network Exploitation PDF..."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Asset Cover URI</Label>
                    <Input
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-12 text-white"
                      placeholder="https://images.operative.net/cover.jpg"
                    />
                    {formData.coverImage && (
                      <div className="mt-2 relative aspect-video w-48 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                        <img
                          src={formData.coverImage}
                          alt="Asset Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Intelligence Summary</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4"
                      placeholder="Detailed technical overview of the resource..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Technical Attributes</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Asset Classification</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="bg-black/40 border-white/10 h-12 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="PDF">Encrypted PDF</SelectItem>
                        <SelectItem value="Video">Intelligence Feed (Video)</SelectItem>
                        <SelectItem value="Link">External Matrix (Link)</SelectItem>
                        <SelectItem value="Document">Technical Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Operational Taxonomy</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-12 text-white"
                      placeholder="Security Tools"
                      required
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Asset source URI</Label>
                    <Input
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-12 text-white"
                      placeholder="https://drive.operative.net/file-0394"
                      required
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Classification Tags</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-emerald-500/50 h-12 text-white"
                      placeholder="hacking, security, leak"
                    />
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between ${formData.isPremium ? 'bg-yellow-500/5 border-yellow-500/20 shadow-lg shadow-yellow-500/5' : 'bg-black/20 border-white/5 opacity-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.isPremium ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-600'}`}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="isPremium" className="font-black text-xs uppercase tracking-widest text-gray-200 cursor-pointer">Prime Exclusive</Label>
                      <p className="text-[10px] text-gray-500">Seal intelligence for verified operatives</p>
                    </div>
                  </div>
                  <Switch
                    id="isPremium"
                    checked={formData.isPremium}
                    onCheckedChange={(val) => setFormData({ ...formData, isPremium: val })}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 border border-emerald-400/20" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                  Synchronizing Repository...
                </div>
              ) : editingId ? (
                <div className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4" /> Finalize Registry Update
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Push New Asset
                </div>
              )}
            </Button>
          </form>
        </Card>
      )}

      {loading && !resources.length ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <div className="h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-mono text-sm animate-pulse">Decrypting Archive Grid...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources?.map((resource) => (
            <Card key={resource._id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md group hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all duration-500 flex flex-col relative rounded-[2rem]">
              <div className="aspect-[16/10] relative overflow-hidden bg-white/5">
                {resource.coverImage ? (
                  <img src={resource.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={resource.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 border-b border-white/5">
                    <Archive className="h-12 w-12 text-gray-800 opacity-20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 flex gap-1.5">
                  <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400 shadow-lg bg-black/60 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
                    {resource.type === 'PDF' && <FileText className="h-2.5 w-2.5" />}
                    {resource.type === 'Video' && <VideoIcon className="h-2.5 w-2.5" />}
                    {resource.type === 'Link' && <Globe className="h-2.5 w-2.5" />}
                    {resource.type}
                  </span>
                  {resource.isPremium && (
                    <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-yellow-500 shadow-lg bg-black/60 border border-yellow-500/30 backdrop-blur-md">
                      PRIME
                    </span>
                  )}
                </div>
              </div>

              <div className="p-7 flex-1 flex flex-col relative">
                <h3 className="font-black text-white text-lg line-clamp-2 leading-tight tracking-tight group-hover:text-emerald-400 transition-colors uppercase mb-3">{resource.title}</h3>

                <p className="text-gray-400 text-[11px] mb-8 line-clamp-3 leading-relaxed opacity-70 font-medium italic">"{resource.description}"</p>

                <div className="mt-auto space-y-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-600 border-b border-white/5 pb-2">
                      <span className="flex items-center gap-1.5"><Layers className="h-3 w-3 text-emerald-500" /> Catalog</span>
                      <span className="text-gray-400">{resource.category}</span>
                    </div>
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {resource.tags.slice(0, 4).map((tag, i) => (
                          <span key={i} className="text-[8px] font-black uppercase tracking-tighter bg-white/5 text-gray-500 px-2 py-0.5 rounded-md border border-white/5 hover:border-emerald-500/30 hover:text-emerald-400 transition-all cursor-default flex items-center gap-1">
                            <Tag className="h-2 w-2" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(resource)}
                      className="flex-1 bg-white/5 hover:bg-emerald-600 text-gray-400 hover:text-white border border-white/10 hover:border-emerald-400/30 text-[9px] font-black uppercase tracking-widest h-10 transition-all duration-300"
                    >
                      <Edit2 className="mr-2 h-3.5 w-3.5" /> Reconfigure
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => handleDelete(resource._id)}
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
          {resources.length === 0 && !loading && (
            <div className="col-span-full py-24 text-center flex flex-col items-center gap-6 bg-white/5 border border-white/10 rounded-[4rem]">
              <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center">
                <Database className="h-10 w-10 text-gray-800 opacity-20" />
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Repository Grid Void</p>
                <p className="text-gray-600 font-medium text-[10px] max-w-xs">No technical assets detected in the repository bank. Begin a manual push to initialize the collection.</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-8 rounded-full text-[9px] font-black uppercase tracking-widest h-10 mt-2"
              >
                Push First Asset
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
