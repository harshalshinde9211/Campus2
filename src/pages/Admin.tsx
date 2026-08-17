import { useEffect, useState, useCallback } from 'react';
import { Shield, Users, FileText, ClipboardCheck, MessageSquare, Trophy, Loader2, Check, X, Trash2, Brain } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, StatCard } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Profile, Note, CommunityPost, Hackathon, Quiz } from '@/lib/types';
import { timeAgo } from '@/lib/constants';

export function Admin() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState({ users: 0, notes: 0, posts: 0, quizzes: 0, hackathons: 0, attempts: 0, registrations: 0, mentorships: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const [u, n, p, h, q, a, r, m] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('notes').select('*, profiles!inner(id, full_name, avatar_url)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('community_posts').select('*, profiles!inner(id, full_name, avatar_url)').order('created_at', { ascending: false }).limit(20),
      supabase.from('hackathons').select('*').order('created_at', { ascending: false }),
      supabase.from('quizzes').select('*').order('created_at', { ascending: false }),
      supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }),
      supabase.from('hackathon_registrations').select('*', { count: 'exact', head: true }),
      supabase.from('mentorship_requests').select('*', { count: 'exact', head: true }),
    ]);

    setUsers((u.data as Profile[]) || []);
    setPendingNotes((n.data as unknown as Note[]) || []);
    setPosts((p.data as unknown as CommunityPost[]) || []);
    setHackathons((h.data as Hackathon[]) || []);
    setQuizzes((q.data as Quiz[]) || []);
    setStats({
      users: u.data?.length || 0,
      notes: (n.data?.length || 0),
      posts: p.data?.length || 0,
      quizzes: q.data?.length || 0,
      hackathons: h.data?.length || 0,
      attempts: a.count || 0,
      registrations: r.count || 0,
      mentorships: m.count || 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approveNote = async (note: Note, approved: boolean) => {
    await supabase.from('notes').update({ status: approved ? 'approved' : 'rejected' }).eq('id', note.id);
    await supabase.from('notifications').insert({
      user_id: note.user_id,
      type: approved ? 'note_approved' : 'note_rejected',
      title: approved ? 'Your note was approved!' : 'Your note was rejected',
      message: `"${note.title}" has been ${approved ? 'approved' : 'rejected'}`,
    });
    if (approved) {
      await supabase.from('profiles').update({ xp: (await supabase.from('profiles').select('xp').eq('id', note.user_id).single()).data?.xp + 20 }).eq('id', note.user_id);
    }
    toast({ title: approved ? 'Note approved! +20 XP to author' : 'Note rejected' });
    load();
  };

  const changeRole = async (userId: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    toast({ title: 'Role updated' });
    load();
  };

  const deletePost = async (id: string) => {
    await supabase.from('community_posts').delete().eq('id', id);
    toast({ title: 'Post deleted' });
    load();
  };

  const deleteHackathon = async (id: string) => {
    await supabase.from('hackathons').delete().eq('id', id);
    toast({ title: 'Hackathon deleted' });
    load();
  };

  const deleteQuiz = async (id: string) => {
    await supabase.from('quizzes').delete().eq('id', id);
    toast({ title: 'Quiz deleted' });
    load();
  };

  if (profile?.role !== 'faculty') {
    return (
      <div>
        <PageHeader title="Admin Panel" />
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Access Denied</p>
            <p className="mt-1 text-sm text-muted-foreground">You need faculty/admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <PageHeader title="Admin Panel" description="Manage users, content, and view analytics." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.users} icon={Users} />
        <StatCard label="Pending Notes" value={stats.notes} icon={FileText} />
        <StatCard label="Quiz Attempts" value={stats.attempts} icon={ClipboardCheck} />
        <StatCard label="Forum Posts" value={stats.posts} icon={MessageSquare} />
        <StatCard label="Hackathons" value={stats.hackathons} icon={Trophy} />
        <StatCard label="Registrations" value={stats.registrations} icon={Users} />
        <StatCard label="Mentorships" value={stats.mentorships} icon={Brain} />
        <StatCard label="Quizzes" value={stats.quizzes} icon={ClipboardCheck} />
      </div>

      <Tabs defaultValue="notes">
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="notes">Notes Approval</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 font-semibold">Pending Note Approvals</h3>
              {pendingNotes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No pending notes.</p>
              ) : (
                <div className="space-y-3">
                  {pendingNotes.map((note) => (
                    <div key={note.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{note.title}</p>
                        <p className="text-xs text-muted-foreground">{note.subject} · by {note.profiles?.full_name} · {timeAgo(note.created_at)}</p>
                      </div>
                      <Button size="sm" onClick={() => approveNote(note, true)}><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => approveNote(note, false)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 font-semibold">User Management</h3>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{user.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.full_name} {user.id === profile?.id && '(You)'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    <Select value={user.role} onValueChange={(v) => changeRole(user.id, v)}>
                      <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forum">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 font-semibold">Forum Moderation</h3>
              {posts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No posts.</p>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{post.title}</p>
                        <p className="text-xs text-muted-foreground">by {post.profiles?.full_name} · {timeAgo(post.created_at)}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deletePost(post.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 font-semibold">Hackathons</h3>
                <div className="space-y-3">
                  {hackathons.map((h) => (
                    <div key={h.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{h.title}</p>
                        <p className="text-xs text-muted-foreground">{h.registration_count} registered</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteHackathon(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 font-semibold">Quizzes</h3>
                <div className="space-y-3">
                  {quizzes.map((q) => (
                    <div key={q.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{q.title}</p>
                        <p className="text-xs text-muted-foreground">{q.subject} · {q.difficulty}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteQuiz(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
