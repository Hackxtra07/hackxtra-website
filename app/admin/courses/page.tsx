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

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  youtubeLink?: string;
  duration?: string;
  instructor?: string;
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
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await request('/api/courses');
      setCourses(data);
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
        youtubeLink: data.url || url, // If it's a video link, put it here
        duration: '', // Scraper might not catch this
        instructor: '',
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
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const url = prompt("Enter Course URL (YouTube, Udemy, etc.):");
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
            {showForm ? 'Cancel' : 'Add New Course'}
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
                  placeholder="e.g., Web Security"
                  required
                />
              </div>
              <div>
                <Label>Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>YouTube Link</Label>
                <Input
                  value={formData.youtubeLink}
                  onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2 hours"
                />
              </div>
            </div>
            <div>
              <Label>Instructor</Label>
              <Input
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="Instructor name"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <Card key={course._id} className="p-4">
            <h3 className="font-bold text-lg mb-2">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{course.description.substring(0, 100)}...</p>
            <div className="space-y-1 text-sm mb-4">
              <p><strong>Category:</strong> {course.category}</p>
              <p><strong>Level:</strong> <span className={`px-2 py-1 rounded text-white ${course.level === 'Beginner' ? 'bg-green-500' : course.level === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'}`}>{course.level}</span></p>
              {course.instructor && <p><strong>Instructor:</strong> {course.instructor}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(course)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(course._id)}
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
