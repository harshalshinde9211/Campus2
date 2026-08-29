import { useEffect, useState, useCallback } from 'react';
import { Search, HelpCircle, Plus, ThumbsUp, ThumbsDown, Check, Loader2, MessageSquare } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS, timeAgo } from '@/lib/constants';
import type { Doubt, DoubtAnswer } from '@/lib/types';

export function Doubts() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', topic: '', tags: '' });
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [answers, setAnswers] = useState<DoubtAnswer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [answersLoading, setAnswersLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (subjectFilter !== 'all') params.set('subject', subjectFilter);
    if (search) params.set('search', search);
    const { data } = await api.get(`/api/doubts?${params}`);
    setDoubts(data || []);
    setLoading(false);
  }, [subjectFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!session) return;
    try {
      await api.post('/api/doubts', {
        title: form.title,
        description: form.description,
        subject: form.subject,
        topic: form.topic,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
      });
      toast({ title: 'Doubt posted!' });
      setAddOpen(false);
      setForm({ title: '', description: '', subject: '', topic: '', tags: '' });
      load();
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const openDoubt = async (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    setAnswersLoading(true);
    await api.patch(`/api/doubts/${doubt.id}`, { views: doubt.views + 1 });
    const { data } = await api.get(`/api/doubts/${doubt.id}/answers`);
    setAnswers(data || []);
    setAnswersLoading(false);
  };

  const handleAnswer = async () => {
    if (!session || !selectedDoubt || !newAnswer) return;
    await api.post(`/api/doubts/${selectedDoubt.id}/answers`, { content: newAnswer });
    setNewAnswer('');
    openDoubt({ ...selectedDoubt, answer_count: selectedDoubt.answer_count + 1 });
  };

  const handleVote = async (answer: DoubtAnswer, type: 'up' | 'down') => {
    const field = type === 'up' ? 'upvotes' : 'downvotes';
    await api.patch(`/api/doubts/answers/${answer.id}`, { [field]: answer[field] + 1 });
    if (selectedDoubt) openDoubt(selectedDoubt);
  };

  const markBest = async (answer: DoubtAnswer) => {
    if (!session || !selectedDoubt || selectedDoubt.user_id !== session.user.id) return;
    await api.post(`/api/doubts/${selectedDoubt.id}/answers/${answer.id}/best`);
    openDoubt(selectedDoubt);
  };

  return (
    <div>
      <PageHeader title="Doubt Discussion" description="Post your doubts and get answers from the community.">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Post Doubt</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Post a Doubt</DialogTitle><DialogDescription>Get help from peers, seniors, and faculty.</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="How does quicksort work?" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Topic</Label><Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!form.title || !form.description}>Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search doubts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : doubts.length === 0 ? (
            <EmptyState icon={HelpCircle} title="No doubts yet" description="Be the first to post a doubt." />
          ) : doubts.map((doubt) => (
            <Card key={doubt.id} className={`cursor-pointer transition-shadow hover:shadow-md ${selectedDoubt?.id === doubt.id ? 'border-primary ring-1 ring-primary' : ''}`} onClick={() => openDoubt(doubt)}>
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{doubt.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                  <span className="text-xs text-muted-foreground">{doubt.profiles?.full_name}</span>
                  <Badge variant="outline" className="ml-1 capitalize text-xs">{doubt.profiles?.role}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">{timeAgo(doubt.created_at)}</span>
                </div>
                <h3 className="mb-1 font-semibold">{doubt.title}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{doubt.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {doubt.subject && <Badge variant="secondary">{doubt.subject}</Badge>}
                  {doubt.topic && <Badge variant="outline">{doubt.topic}</Badge>}
                  <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{doubt.answer_count}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{doubt.upvotes}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          {selectedDoubt ? (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-2 text-lg font-bold">{selectedDoubt.title}</h2>
                <p className="mb-4 text-sm text-muted-foreground">{selectedDoubt.description}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedDoubt.subject && <Badge variant="secondary">{selectedDoubt.subject}</Badge>}
                  {selectedDoubt.topic && <Badge variant="outline">{selectedDoubt.topic}</Badge>}
                  {selectedDoubt.tags?.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                </div>
                <div className="mb-4 border-t pt-4">
                  <h3 className="mb-3 font-semibold">Answers ({answers.length})</h3>
                  {answersLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                  ) : answers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No answers yet. Be the first to answer!</p>
                  ) : (
                    <div className="space-y-3">
                      {answers.map((ans) => (
                        <div key={ans.id} className={`rounded-lg border p-3 ${ans.is_best ? 'border-green-500 bg-green-500/5' : ''}`}>
                          <div className="mb-2 flex items-center gap-2">
                            <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{ans.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                            <span className="text-xs font-medium">{ans.profiles?.full_name}</span>
                            <Badge variant="outline" className="text-xs capitalize">{ans.profiles?.role}</Badge>
                            {ans.is_best && <Badge className="bg-green-500 text-xs">Best Answer</Badge>}
                            <span className="ml-auto text-xs text-muted-foreground">{timeAgo(ans.created_at)}</span>
                          </div>
                          <p className="mb-2 text-sm">{ans.content}</p>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleVote(ans, 'up')}><ThumbsUp className="h-3.5 w-3.5" />{ans.upvotes}</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleVote(ans, 'down')}><ThumbsDown className="h-3.5 w-3.5" />{ans.downvotes}</Button>
                            {session?.user.id === selectedDoubt.user_id && !ans.is_best && (
                              <Button size="sm" variant="ghost" onClick={() => markBest(ans)}><Check className="h-3.5 w-3.5" /> Mark Best</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {session && (
                  <div className="border-t pt-4">
                    <Textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="Write your answer..." className="mb-2" />
                    <Button onClick={handleAnswer} disabled={!newAnswer}>Post Answer</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed py-20 text-center">
              <p className="text-sm text-muted-foreground">Select a doubt to view answers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
