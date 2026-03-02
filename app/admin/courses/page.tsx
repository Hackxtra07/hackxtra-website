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

import { BookOpen, Upload, Video, Clock, Plus, Trash2, Edit2, Loader2, Sparkles, Shield, User, ExternalLink, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  youtubeLink?: string;
  duration?: string;
  instructor?: string;
  coverImage?: string;
  isPremium: boolean;
}

export default function AdminCoursesPage() {
  const { request, loading } = useApi();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    youtubeLink: '',
    duration: '',
    instructor: '',
    coverImage: '',
    isPremium: false,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await request('/api/courses?admin=true');
      setCourses(data.courses || data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch courses', variant: 'destructive' });
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
        youtubeLink: data.url || url,
        duration: '',
        instructor: '',
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
      if (editingId) {
        await request(`/api/courses/${editingId}`, {
          method: 'PUT',
          body: formData,
        });
        toast({ title: 'Success', description: 'Course updated!' });
      } else {
        await request('/api/courses', {
          method: 'POST',
          body: formData,
        });
        toast({ title: 'Success', description: 'Course created!' });
      }
      resetForm();
      fetchCourses();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save course', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await request(`/api/courses/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Course deleted!' });
      fetchCourses();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete course', variant: 'destructive' });
    }
  };

  const handleEdit = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      youtubeLink: course.youtubeLink || '',
      duration: course.duration || '',
      instructor: course.instructor || '',
      coverImage: course.coverImage || '',
      isPremium: course.isPremium || false,
    });
    setEditingId(course._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      level: 'Beginner',
      youtubeLink: '',
      duration: '',
      instructor: '',
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-white tracking-tighter">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
              <BookOpen className="h-8 w-8" />
            </div>
            Academy Forge
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Curate and publish elite educational trajectories for the operative network.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
          <Button
            onClick={() => {
              const url = prompt("Enter Course Source URL (YouTube, Udemy, etc.):");
              if (url) importFromUrl(url);
            }}
            variant="outline"
            className="h-12 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white px-6 font-black uppercase tracking-[0.2em] text-[10px]"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Extract Intelligence
          </Button>
          <Button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className={`h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-blue-600 border-blue-400/30 text-white hover:bg-blue-500 shadow-blue-500/20'}`}
          >
            {showForm ? 'Abort Entry' : 'Manual Manifest'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Core Manifest</h3>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Archive Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12 text-white placeholder:text-gray-700"
                      placeholder="Definitive Guide to Network Infiltration..."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Abstract Intelligence</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4"
                      placeholder="Provide a comprehensive operational summary..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Technical Specifications</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Taxonomy</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12 text-white"
                      placeholder="Web Security"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Proficiency Level</Label>
                    <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                      <SelectTrigger className="bg-black/40 border-white/10 h-12 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="Beginner">Initiate (Beginner)</SelectItem>
                        <SelectItem value="Intermediate">Operative (Intermediate)</SelectItem>
                        <SelectItem value="Advanced">Elite (Advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Signal URL (YouTube)</Label>
                    <Input
                      value={formData.youtubeLink}
                      onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12 text-white"
                      placeholder="Intelligence feed link"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Temporal Duration</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12 text-white"
                      placeholder="e.g. 120 mins"
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Visual Asset URL</Label>
                    <Input
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12 text-white"
                      placeholder="Background visual URI"
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Intelligence Source (Instructor)</Label>
                    <Input
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12 text-white"
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between ${formData.isPremium ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-black/20 border-white/5 opacity-50'}`}>
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

            <Button type="submit" className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 border border-blue-400/20" disabled={loading}>
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
                  <Plus className="h-4 w-4" /> Instantiate New Archive
                </div>
              )}
            </Button>
          </form>
        </Card>
      )}

      {loading && !courses.length ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-mono text-sm animate-pulse">Accessing Encrypted Archive...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card key={course._id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md group hover:border-blue-500/30 hover:bg-white/[0.08] transition-all duration-500 flex flex-col relative">
              <div className="aspect-video relative overflow-hidden bg-white/5">
                {course.coverImage ? (
                  <img src={course.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={course.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 border-b border-white/5">
                    <BookOpen className="h-10 w-10 text-gray-800 opacity-20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                {course.isPremium && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider flex items-center gap-1 border border-yellow-400/30">
                    <Sparkles className="h-2.5 w-2.5" /> PRIME
                  </div>
                )}

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-white shadow-lg border ${course.level === 'Beginner' ? 'bg-green-600/80 border-green-400/30' : course.level === 'Intermediate' ? 'bg-blue-600/80 border-blue-400/30' : 'bg-red-600/80 border-red-400/30'}`}>
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col relative">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="font-bold text-white text-md line-clamp-2 leading-tight tracking-tight group-hover:text-blue-400 transition-colors uppercase">{course.title}</h3>
                </div>

                <p className="text-gray-400 text-[11px] mb-6 line-clamp-2 leading-relaxed opacity-80 italic font-medium">"{course.description}"</p>

                <div className="mt-auto grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    <div className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                      <Globe className="h-2.5 w-2.5 text-blue-500" />
                      {course.category}
                    </div>
                    {course.duration && (
                      <div className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <Clock className="h-2.5 w-2.5 text-indigo-500" />
                        {course.duration}
                      </div>
                    )}
                  </div>

                  {course.instructor && (
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-600 bg-white/5 p-2 rounded-xl border border-white/5">
                      <User className="h-3 w-3 text-blue-400" />
                      <span className="truncate">{course.instructor}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(course)}
                    className="flex-1 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white border border-white/10 hover:border-blue-400/30 text-[9px] font-black uppercase tracking-widest h-9 transition-all duration-300"
                  >
                    <Edit2 className="mr-2 h-3.5 w-3.5" /> Recalibrate
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => handleDelete(course._id)}
                    variant="ghost"
                    className="w-9 h-9 text-gray-600 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {courses.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 bg-white/5 border border-white/10 rounded-[3rem]">
              <BookOpen className="h-16 w-16 text-gray-800 opacity-20" />
              <p className="text-gray-500 font-mono text-sm">The academy repository is empty. Curate new intelligence to begin.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
