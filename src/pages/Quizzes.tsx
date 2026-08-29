import { useEffect, useState, useCallback } from 'react';
import { ClipboardCheck, Plus, Clock, Play, Trophy, Loader2, CheckCircle2, XCircle, Plus as PlusIcon } from 'lucide-react';
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
import { SUBJECTS, timeAgo } from '@/lib/constants';
import type { Quiz, QuizQuestion, QuizAttempt } from '@/lib/types';

export function Quizzes() {
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [form, setForm] = useState({ title: '', description: '', subject: '', topic: '', difficulty: 'medium', duration: '30' });
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correct: 0, explanation: '' }]);

  const isFaculty = profile?.role === 'faculty';

  const load = useCallback(async () => {
    setLoading(true);
    const [q, a] = await Promise.all([
      api.get('/api/quizzes').then(r => r.data).catch(() => []),
      session ? api.get('/api/quizzes/attempts/mine?limit=5').then(r => r.data).catch(() => []) : Promise.resolve([]),
    ]);
    setQuizzes(q);
    setAttempts(a);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const startQuiz = async (quiz: Quiz) => {
    const { data } = await api.get(`/api/quizzes/${quiz.id}/questions`);
    setQuizQuestions(data || []);
    setAnswers(new Array((data || []).length).fill(-1));
    setStartTime(Date.now());
    setActiveQuiz(quiz);
    setResult(null);
  };

  const submitQuiz = async () => {
    if (!session || !activeQuiz || quizQuestions.length === 0) return;
    let score = 0;
    quizQuestions.forEach((q, i) => { if (answers[i] === q.correct_index) score++; });
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    await api.post('/api/quizzes/attempts', {
      quiz_id: activeQuiz.id,
      score,
      total_questions: quizQuestions.length,
      percentage,
      time_spent_seconds: timeSpent,
      answers,
    });
    setResult({ score, total: quizQuestions.length, percentage });
    load();
  };

  const handleCreate = async () => {
    if (!session) return;
    try {
      await api.post('/api/quizzes', {
        title: form.title,
        description: form.description,
        subject: form.subject,
        topic: form.topic,
        difficulty: form.difficulty,
        duration_minutes: parseInt(form.duration),
        questions: questions.filter((q) => q.question && q.options.every((o) => o)).map((q) => ({
          question: q.question,
          options: q.options,
          correct_index: q.correct,
          explanation: q.explanation,
        })),
      });
      toast({ title: 'Quiz created!' });
      setCreateOpen(false);
      setForm({ title: '', description: '', subject: '', topic: '', difficulty: 'medium', duration: '30' });
      setQuestions([{ question: '', options: ['', '', '', ''], correct: 0, explanation: '' }]);
      load();
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  if (activeQuiz && result === null) {
    return (
      <div>
        <PageHeader title={activeQuiz.title} description={`${activeQuiz.subject} · ${activeQuiz.difficulty} · ${activeQuiz.duration_minutes} min`} />
        <div className="mx-auto max-w-2xl space-y-6">
          {quizQuestions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="p-5">
                <p className="mb-4 font-medium">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, j) => (
                    <button key={j} onClick={() => setAnswers((prev) => { const next = [...prev]; next[i] = j; return next; })}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${answers[i] === j ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${answers[i] === j ? 'border-primary bg-primary text-primary-foreground' : ''}`}>
                        {answers[i] === j && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={submitQuiz} className="w-full" size="lg">Submit Quiz</Button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <PageHeader title="Quiz Results" />
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardContent className="p-8">
              <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${result.percentage >= 60 ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                {result.percentage >= 60 ? <CheckCircle2 className="h-10 w-10 text-green-500" /> : <XCircle className="h-10 w-10 text-destructive" />}
              </div>
              <h2 className="mb-2 text-3xl font-bold">{result.percentage}%</h2>
              <p className="mb-4 text-muted-foreground">{result.score} out of {result.total} correct</p>
              <p className="mb-6 text-sm text-muted-foreground">+10 XP earned!</p>
              <Button onClick={() => { setActiveQuiz(null); setResult(null); }} className="w-full">Back to Quizzes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Quiz System" description="Test your knowledge with subject-wise quizzes.">
        {isFaculty && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Create Quiz</Button></DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Quiz</DialogTitle><DialogDescription>Create a new quiz with MCQ questions.</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
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
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
                </div>
                {questions.map((q, qi) => (
                  <div key={qi} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Question {qi + 1}</span>
                      {questions.length > 1 && <Button size="sm" variant="ghost" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}>Remove</Button>}
                    </div>
                    <Input className="mb-2" placeholder="Question text" value={q.question} onChange={(e) => setQuestions(questions.map((qq, i) => i === qi ? { ...qq, question: e.target.value } : qq))} />
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="mb-1 flex items-center gap-2">
                        <button onClick={() => setQuestions(questions.map((qq, i) => i === qi ? { ...qq, correct: oi } : qq))}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${q.correct === oi ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                          {q.correct === oi && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                        <Input placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => setQuestions(questions.map((qq, i) => i === qi ? { ...qq, options: qq.options.map((o, j) => j === oi ? e.target.value : o) } : qq))} />
                      </div>
                    ))}
                    <Input className="mt-2" placeholder="Explanation (optional)" value={q.explanation} onChange={(e) => setQuestions(questions.map((qq, i) => i === qi ? { ...qq, explanation: e.target.value } : qq))} />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }])}>
                  <PlusIcon className="mr-1 h-4 w-4" /> Add Question
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!form.title || !form.subject}>Create Quiz</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {attempts.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Trophy className="h-4 w-4" /> Recent Results</h3>
            <div className="flex flex-wrap gap-3">
              {attempts.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <span className="text-sm font-bold text-primary">{Number(a.percentage).toFixed(0)}%</span>
                  <span className="text-xs text-muted-foreground">{a.score}/{a.total_questions} · {timeAgo(a.created_at)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : quizzes.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No quizzes available" description="Check back later for new quizzes." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><ClipboardCheck className="h-5 w-5 text-primary" /></div>
                  <Badge variant={quiz.difficulty === 'easy' ? 'secondary' : quiz.difficulty === 'hard' ? 'destructive' : 'default'}>{quiz.difficulty}</Badge>
                </div>
                <h3 className="mb-1 font-semibold">{quiz.title}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{quiz.description || quiz.subject}</p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{quiz.subject}</Badge>
                  {quiz.topic && <Badge variant="outline">{quiz.topic}</Badge>}
                </div>
                <div className="mt-auto flex items-center justify-between border-t pt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />{quiz.duration_minutes} min</span>
                  <Button size="sm" onClick={() => startQuiz(quiz)}><Play className="mr-1 h-3.5 w-3.5" /> Start</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
