import { useState, useEffect, useCallback } from 'react';
import { Briefcase, Brain, Code, MessageCircle, Save, Loader2, CheckCircle2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { timeAgo } from '@/lib/constants';

const APTITUDE_QUESTIONS = [
  { q: 'A train 150m long passes a pole in 15 seconds. What is the speed of the train?', a: '36 km/h', subject: 'Quantitative' },
  { q: 'If 2x + 3 = 15, find x.', a: 'x = 6', subject: 'Quantitative' },
  { q: 'Find the next number: 2, 6, 12, 20, 30, ?', a: '42', subject: 'Quantitative' },
  { q: 'A shopkeeper sells an item at 20% profit. If CP is 500, find SP.', a: '600', subject: 'Quantitative' },
  { q: 'All cats are animals. Some animals are pets. Therefore?', a: 'Some cats may be pets', subject: 'Logical' },
  { q: 'Find the odd one: 3, 5, 7, 9, 11', a: '9 (not prime)', subject: 'Logical' },
  { q: 'Choose the synonym for "Abundant".', a: 'Plentiful', subject: 'Verbal' },
  { q: 'Choose the antonym for "Diligent".', a: 'Lazy', subject: 'Verbal' },
];

const TECHNICAL_QUESTIONS = [
  { q: 'What is the time complexity of binary search?', a: 'O(log n)', topic: 'DSA' },
  { q: 'What is polymorphism in OOP?', a: 'The ability of different objects to respond to the same message in different ways.', topic: 'OOP' },
  { q: 'What is a foreign key in DBMS?', a: 'A field that uniquely identifies a row in another table.', topic: 'DBMS' },
  { q: 'What is the difference between TCP and UDP?', a: 'TCP is connection-oriented and reliable; UDP is connectionless and unreliable.', topic: 'Networks' },
  { q: 'What is a deadlock in OS?', a: 'A situation where two or more processes are unable to proceed because each is waiting for the other to release a resource.', topic: 'OS' },
  { q: 'What is a pointer in C?', a: 'A variable that stores the memory address of another variable.', topic: 'C' },
  { q: 'What is the difference between == and === in JavaScript?', a: '== compares values with type coercion; === compares values and types without coercion.', topic: 'JavaScript' },
  { q: 'What is a virtual function in C++?', a: 'A member function that can be overridden in derived classes, enabling runtime polymorphism.', topic: 'C++' },
];

const INTERVIEW_QUESTIONS = [
  { q: 'Tell me about yourself.', type: 'HR' },
  { q: 'Why do you want to join our company?', type: 'HR' },
  { q: 'What are your strengths and weaknesses?', type: 'HR' },
  { q: 'Where do you see yourself in 5 years?', type: 'HR' },
  { q: 'Describe a challenging project you worked on.', type: 'Technical' },
  { q: 'How do you handle tight deadlines?', type: 'Behavioral' },
  { q: 'Describe a time you had a conflict with a team member.', type: 'Behavioral' },
  { q: 'Why should we hire you?', type: 'HR' },
];

const CODING_TOPICS = [
  { level: 'Easy', problems: ['Two Sum', 'Reverse String', 'Valid Parentheses', 'Merge Sorted Arrays', 'Palindrome Check'] },
  { level: 'Medium', problems: ['Longest Substring Without Repeating Characters', 'Add Two Numbers', 'Container With Most Water', '3Sum', 'Group Anagrams'] },
  { level: 'Hard', problems: ['Regular Expression Matching', 'Merge K Sorted Lists', 'Trapping Rain Water', 'N-Queens', 'Median of Two Sorted Arrays'] },
];

interface MockInterviewRecord {
  id: string;
  question: string;
  answer: string;
  rating: number;
  created_at: string;
}

export function Placement() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('aptitude');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [interviewIdx, setInterviewIdx] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewRating, setInterviewRating] = useState(3);
  const [history, setHistory] = useState<MockInterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('type', 'mock_interview')
      .order('created_at', { ascending: false })
      .limit(10);
    setHistory((data as MockInterviewRecord[]) || []);
    setLoading(false);
  }, [session]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const saveInterview = async () => {
    if (!session || !interviewAnswer) return;
    const q = INTERVIEW_QUESTIONS[interviewIdx];
    await supabase.from('notifications').insert({
      user_id: session.user.id,
      type: 'mock_interview',
      title: q.q,
      message: interviewAnswer,
      link: String(interviewRating),
    });
    toast({ title: 'Answer saved!' });
    setInterviewAnswer('');
    setInterviewRating(3);
    setInterviewIdx((prev) => (prev + 1) % INTERVIEW_QUESTIONS.length);
    loadHistory();
  };

  return (
    <div>
      <PageHeader title="Placement Preparation" description="Aptitude, technical, coding, and interview prep in one place." />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="aptitude"><Brain className="mr-1 h-4 w-4" /> Aptitude</TabsTrigger>
          <TabsTrigger value="technical"><Briefcase className="mr-1 h-4 w-4" /> Technical</TabsTrigger>
          <TabsTrigger value="coding"><Code className="mr-1 h-4 w-4" /> Coding</TabsTrigger>
          <TabsTrigger value="interview"><MessageCircle className="mr-1 h-4 w-4" /> Interview</TabsTrigger>
        </TabsList>

        <TabsContent value="aptitude">
          <div className="space-y-4">
            {APTITUDE_QUESTIONS.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="font-medium">{item.q}</p>
                    <Badge variant="secondary">{item.subject}</Badge>
                  </div>
                  <Textarea
                    placeholder="Type your answer..."
                    value={answers[`apt-${i}`] || ''}
                    onChange={(e) => setAnswers({ ...answers, [`apt-${i}`]: e.target.value })}
                  />
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-primary hover:underline">Show Answer</summary>
                    <p className="mt-1 rounded-lg bg-accent p-2 text-muted-foreground">{item.a}</p>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <div className="space-y-4">
            {TECHNICAL_QUESTIONS.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="font-medium">{item.q}</p>
                    <Badge variant="secondary">{item.topic}</Badge>
                  </div>
                  <Textarea
                    placeholder="Type your answer..."
                    value={answers[`tech-${i}`] || ''}
                    onChange={(e) => setAnswers({ ...answers, [`tech-${i}`]: e.target.value })}
                  />
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-primary hover:underline">Show Answer</summary>
                    <p className="mt-1 rounded-lg bg-accent p-2 text-muted-foreground">{item.a}</p>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coding">
          <div className="space-y-6">
            {CODING_TOPICS.map((topic) => (
              <Card key={topic.level}>
                <CardContent className="p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Badge variant={topic.level === 'Easy' ? 'secondary' : topic.level === 'Hard' ? 'destructive' : 'default'}>{topic.level}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {topic.problems.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                        <Code className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{p}</span>
                        <Button size="sm" variant="ghost" className="ml-auto">Practice</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Mock Interview</h3>
                  <Badge variant="outline">{INTERVIEW_QUESTIONS[interviewIdx].type}</Badge>
                </div>
                <p className="mb-4 text-lg font-medium">{INTERVIEW_QUESTIONS[interviewIdx].q}</p>
                <Textarea
                  placeholder="Type your answer..."
                  value={interviewAnswer}
                  onChange={(e) => setInterviewAnswer(e.target.value)}
                  rows={6}
                  className="mb-4"
                />
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm font-medium">Self-rating:</span>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setInterviewRating(r)}>
                      <Star className={`h-5 w-5 ${r <= interviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
                <Button onClick={saveInterview} disabled={!interviewAnswer}>
                  <Save className="mr-2 h-4 w-4" /> Save Answer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 font-semibold">Interview History</h3>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : history.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No interview answers saved yet.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.id} className="rounded-lg border p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-sm font-medium">{h.title}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: parseInt(h.link) || 0 }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{h.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{timeAgo(h.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
