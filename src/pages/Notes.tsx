import { useEffect, useState, useCallback } from 'react';
import { Upload, Search, Download, Heart, Star, FileText, Loader2, Eye } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, EmptyState } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { BRANCHES, SUBJECTS, timeAgo } from '@/lib/constants';
import type { Note } from '@/lib/types';

export function Notes() {
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', branch: '', semester: '', department: '' });
  const [file, setFile] = useState<File | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sortBy });
    if (branchFilter !== 'all') params.set('branch', branchFilter);
    if (subjectFilter !== 'all') params.set('subject', subjectFilter);
    if (search) params.set('search', search);
    const { data } = await api.get(`/api/notes?${params}`);
    setNotes(data || []);
    setLoading(false);
  }, [branchFilter, subjectFilter, search, sortBy]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleUpload = async () => {
    if (!file || !session) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || '';
      // For file storage we use a base64 data URL approach (no cloud storage in this migration)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const file_url = e.target?.result as string;
        await api.post('/api/notes', {
          title: form.title,
          description: form.description,
          file_url,
          file_type: ext,
          file_name: file.name,
          file_size: file.size,
          subject: form.subject,
          branch: form.branch,
          semester: form.semester ? parseInt(form.semester) : null,
          department: form.department || profile?.department || '',
          status: 'pending',
        });
        toast({ title: 'Note uploaded!', description: 'Your note is pending admin approval.' });
        setUploadOpen(false);
        setForm({ title: '', description: '', subject: '', branch: '', semester: '', department: '' });
        setFile(null);
        setUploading(false);
        loadNotes();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast({ title: 'Upload failed', description: (err as Error).message, variant: 'destructive' });
      setUploading(false);
    }
  };

  const handleLike = async (note: Note) => {
    if (!session) return;
    await api.post(`/api/notes/${note.id}/like`);
    loadNotes();
  };

  const handleDownload = async (note: Note) => {
    await api.post(`/api/notes/${note.id}/download`);
    window.open(note.file_url, '_blank');
    loadNotes();
  };

  return (
    <div>
      <PageHeader title="Notes Sharing" description="Upload, share, and download academic notes.">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button><Upload className="mr-2 h-4 w-4" /> Upload Note</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload a Note</DialogTitle>
              <DialogDescription>Your note will be reviewed by an admin before going public.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Data Structures - Linked Lists" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Semester</Label><Input type="number" min="1" max="8" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
                <div className="space-y-2"><Label>File (PDF, DOCX, PPT)</Label><Input type="file" accept=".pdf,.docx,.ppt,.pptx" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={uploading || !file || !form.title || !form.subject}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Branches</SelectItem>{BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Subjects</SelectItem>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="downloads">Most Downloaded</SelectItem>
            <SelectItem value="likes">Most Liked</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : notes.length === 0 ? (
        <EmptyState icon={FileText} title="No notes found" description="Try adjusting filters or upload a new note." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => {
            const avgRating = note.rating_count > 0 ? (note.rating_sum / note.rating_count).toFixed(1) : '—';
            return (
              <Card key={note.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                    <Badge variant="secondary">{(note.file_type || 'file').toUpperCase()}</Badge>
                  </div>
                  <h3 className="mb-1 font-semibold leading-tight">{note.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{note.description || 'No description'}</p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{note.subject}</Badge>
                    {note.branch && <Badge variant="outline">{note.branch}</Badge>}
                    {note.semester && <Badge variant="outline">Sem {note.semester}</Badge>}
                  </div>
                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>by {note.profiles?.full_name || 'Unknown'}</span>
                    <span>·</span>
                    <span>{timeAgo(note.created_at)}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{note.views}</span>
                      <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{note.downloads}</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{avgRating}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleLike(note)}><Heart className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDownload(note)}><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
