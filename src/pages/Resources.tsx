import { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, Download, ExternalLink, Star, Loader2, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, EmptyState } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { BRANCHES, SUBJECTS, timeAgo } from '@/lib/constants';
import type { Resource } from '@/lib/types';

const RESOURCE_TYPES = [
  { value: 'chapter_notes', label: 'Chapter Notes' },
  { value: 'important_questions', label: 'Important Questions' },
  { value: 'previous_year_questions', label: 'Previous Year Questions' },
  { value: 'reference_materials', label: 'Reference Materials' },
  { value: 'study_materials', label: 'Study Materials' },
];

export function Resources() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', resource_type: 'chapter_notes', subject: '', branch: '', semester: '', external_url: '',
  });

  const isFaculty = profile?.role === 'faculty';

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('resources')
      .select('*, profiles!inner(id, full_name, avatar_url)');
    if (typeFilter !== 'all') query = query.eq('resource_type', typeFilter);
    if (subjectFilter !== 'all') query = query.eq('subject', subjectFilter);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false }).limit(50);
    const { data } = await query;
    setResources((data as unknown as Resource[]) || []);
    setLoading(false);
  }, [typeFilter, subjectFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    try {
      await supabase.from('resources').insert({
        title: form.title,
        description: form.description,
        resource_type: form.resource_type,
        subject: form.subject,
        branch: form.branch,
        semester: form.semester ? parseInt(form.semester) : null,
        external_url: form.external_url,
      });
      toast({ title: 'Resource added!' });
      setAddOpen(false);
      setForm({ title: '', description: '', resource_type: 'chapter_notes', subject: '', branch: '', semester: '', external_url: '' });
      load();
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader title="Study Resource Center" description="Chapter notes, important questions, PYQs, and reference materials.">
        {isFaculty && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><BookOpen className="mr-2 h-4 w-4" /> Add Resource</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Study Resource</DialogTitle>
                <DialogDescription>Add study material for students.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.resource_type} onValueChange={(v) => setForm({ ...form, resource_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RESOURCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input type="number" min="1" max="8" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>External URL (optional)</Label>
                  <Input value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={!form.title || !form.subject}>Add Resource</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {RESOURCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : resources.length === 0 ? (
        <EmptyState icon={BookOpen} title="No resources found" description="Try adjusting filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((res) => {
            const typeLabel = RESOURCE_TYPES.find((t) => t.value === res.resource_type)?.label || res.resource_type;
            const avgRating = res.rating_count > 0 ? (res.rating_sum / res.rating_count).toFixed(1) : '—';
            return (
              <Card key={res.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{typeLabel}</Badge>
                  </div>
                  <h3 className="mb-1 font-semibold leading-tight">{res.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{res.description || 'No description'}</p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{res.subject}</Badge>
                    {res.branch && <Badge variant="outline">{res.branch}</Badge>}
                    {res.semester && <Badge variant="outline">Sem {res.semester}</Badge>}
                  </div>
                  <div className="mb-3 text-xs text-muted-foreground">
                    by {res.profiles?.full_name || 'Faculty'} · {timeAgo(res.created_at)}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{avgRating}</span>
                      <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{res.downloads}</span>
                    </div>
                    {res.external_url && (
                      <Button size="sm" variant="outline" onClick={() => window.open(res.external_url, '_blank')}>
                        <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open
                      </Button>
                    )}
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
