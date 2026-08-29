import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ClipboardCheck, FileUser, Map, Briefcase,
  Users, Trophy, MessageSquare, Flame, Star, TrendingUp,
  BookOpen, Award, Zap, Shield, CheckCircle2, Clock,
  AlertCircle, UserCheck, PlusCircle, BarChart2, Bell,
  Send, GraduationCap, Lightbulb,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader, StatCard } from '@/components/PageHeader';
import { levelFromXp, profileCompletion, timeAgo } from '@/lib/constants';
import type { Note, QuizAttempt, CommunityPost, Hackathon, Profile } from '@/lib/types';

interface Activity { type: string; title: string; time: string; }

// ─────────────────────────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────────────────────────
function StudentDashboard() {
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [upcomingHackathons, setUpcomingHackathons] = useState<Hackathon[]>([]);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const [notes, attempts, posts, hacks, leaders] = await Promise.all([
        api.get(`/api/notes?userId=${session.user.id}&limit=3`).then(r => r.data).catch(() => []),
        api.get('/api/quizzes/attempts/mine?limit=3').then(r => r.data).catch(() => []),
        api.get('/api/community/posts?limit=3').then(r => r.data).catch(() => []),
        api.get('/api/hackathons').then(r =>
          r.data.filter((h: Hackathon) => new Date(h.start_date) >= new Date()).slice(0, 3)
        ).catch(() => []),
        api.get('/api/users/leaderboard?limit=5').then(r => r.data).catch(() => []),
      ]);
      setRecentNotes(notes);
      setQuizAttempts(attempts);
      setRecentPosts(posts);
      setUpcomingHackathons(hacks);
      setLeaderboard(leaders);
      const acts: Activity[] = [];
      (notes as Note[]).forEach(n => acts.push({ type: 'note', title: `Uploaded "${n.title}"`, time: n.created_at }));
      (attempts as QuizAttempt[]).forEach(a => acts.push({ type: 'quiz', title: `Scored ${a.percentage}% on quiz`, time: a.created_at }));
      (posts as CommunityPost[]).forEach(p => acts.push({ type: 'post', title: `Posted "${p.title}"`, time: p.created_at }));
      acts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(acts.slice(0, 6));
      setLoading(false);
    };
    load();
  }, [session]);

  const completion = profile ? profileCompletion(profile as unknown as Partial<Record<string, unknown>>) : 0;
  const level = levelFromXp(profile?.xp || 0);

  const quickActions = [
    { label: 'Upload Notes', icon: FileText, path: '/notes' },
    { label: 'Take Quiz', icon: ClipboardCheck, path: '/quizzes' },
    { label: 'Create Resume', icon: FileUser, path: '/resume' },
    { label: 'Career Roadmap', icon: Map, path: '/roadmap' },
    { label: 'Placement Prep', icon: Briefcase, path: '/placement' },
    { label: 'Find Senior', icon: Users, path: '/networking' },
    { label: 'Join Hackathon', icon: Trophy, path: '/hackathons' },
    { label: 'Community', icon: MessageSquare, path: '/community' },
  ];

  if (loading) return <DashboardLoader />;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Student'}! 👋`}
        description="Track your academic progress and stay connected with your campus."
      />

      {/* Role badge */}
      <div className="mb-6 flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-sm">
          <GraduationCap className="h-3.5 w-3.5" />
          Student · Semester {profile?.semester || 1} · {profile?.branch || 'Engineering'}
        </Badge>
        {profile?.college && (
          <Badge variant="outline" className="text-sm">{profile.college}</Badge>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="XP Points" value={profile?.xp || 0} icon={Zap} trend={`Level ${level}`} />
        <StatCard label="Learning Streak" value={`${profile?.learning_streak || 0} days`} icon={Flame} />
        <StatCard label="Profile Complete" value={`${completion}%`} icon={Star} />
        <StatCard label="Quiz Attempts" value={quizAttempts.length} icon={ClipboardCheck} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          {/* Profile completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>A complete profile helps seniors and faculty find you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{completion}% complete</span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>Edit Profile</Button>
              </div>
              <Progress value={completion} className="h-2" />
              {completion < 60 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Add your skills, bio, and social links to reach 60%
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickActions.map(action => (
                  <button key={action.label} onClick={() => navigate(action.path)}
                    className="group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-primary hover:bg-accent">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-center text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Recent Notes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <div className="py-6 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No notes uploaded yet.</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/notes')}>
                    <PlusCircle className="mr-1 h-3.5 w-3.5" /> Upload Note
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotes.map(note => (
                    <div key={note.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{note.title}</p>
                          <p className="text-xs text-muted-foreground">{note.subject} · {timeAgo(note.created_at)}</p>
                        </div>
                      </div>
                      <Badge variant={note.status === 'approved' ? 'default' : note.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {note.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz history */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Quiz Results</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/quizzes')}>Take Quiz</Button>
              </div>
            </CardHeader>
            <CardContent>
              {quizAttempts.length === 0 ? (
                <div className="py-6 text-center">
                  <ClipboardCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No quizzes taken yet.</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/quizzes')}>
                    Start a Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizAttempts.map(attempt => (
                    <div key={attempt.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${Number(attempt.percentage) >= 80 ? 'bg-green-500/10' : Number(attempt.percentage) >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                          <ClipboardCheck className={`h-4 w-4 ${Number(attempt.percentage) >= 80 ? 'text-green-600' : Number(attempt.percentage) >= 50 ? 'text-yellow-600' : 'text-red-500'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{attempt.score}/{attempt.total_questions} correct</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(attempt.created_at)}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${Number(attempt.percentage) >= 80 ? 'text-green-600' : Number(attempt.percentage) >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {Number(attempt.percentage).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No data yet</p>
                ) : leaderboard.map((user, i) => (
                  <div key={user.id} className={`flex items-center gap-3 rounded-lg p-2 ${i === 0 ? 'bg-yellow-500/10' : i === 1 ? 'bg-gray-400/10' : i === 2 ? 'bg-orange-700/10' : ''}`}>
                    <span className={`w-5 text-center text-sm font-bold ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{user.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.id === session?.user.id ? 'You ⭐' : user.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">Level {levelFromXp(user.xp)}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{user.xp} XP</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming hackathons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4" />Upcoming Hackathons</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/hackathons')}>All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingHackathons.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No upcoming hackathons</p>
              ) : upcomingHackathons.map(hack => (
                <div key={hack.id} className="mb-2 cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent/50" onClick={() => navigate('/hackathons')}>
                  <p className="text-sm font-medium">{hack.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(hack.start_date).toLocaleDateString()}</p>
                  {hack.prize && <Badge variant="secondary" className="mt-1.5 text-xs">{hack.prize}</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-4 w-4" />Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent">
                        {act.type === 'note' ? <BookOpen className="h-3.5 w-3.5" /> : act.type === 'quiz' ? <ClipboardCheck className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs">{act.title}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(act.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SENIOR DASHBOARD
// ─────────────────────────────────────────────────────────────────
function SeniorDashboard() {
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const [mentorships, setMentorships] = useState<{ id: string; junior_id: string; message: string; status: string; created_at: string }[]>([]);
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const [notes, posts, hacks, leaders, reqs, studs] = await Promise.all([
        api.get(`/api/notes?userId=${session.user.id}&limit=5`).then(r => r.data).catch(() => []),
        api.get('/api/community/posts?limit=4').then(r => r.data).catch(() => []),
        api.get('/api/hackathons').then(r =>
          r.data.filter((h: Hackathon) => new Date(h.start_date) >= new Date()).slice(0, 3)
        ).catch(() => []),
        api.get('/api/users/leaderboard?limit=5').then(r => r.data).catch(() => []),
        api.get('/api/networking/requests').then(r => r.data).catch(() => []),
        api.get('/api/users?role=student').then(r => r.data.slice(0, 4)).catch(() => []),
      ]);
      setMyNotes(notes);
      setMyPosts(posts);
      setHackathons(hacks);
      setLeaderboard(leaders);
      setMentorships(reqs.filter((r: { senior_id: string }) => r.senior_id === session.user.id));
      setStudents(studs);
      setLoading(false);
    };
    load();
  }, [session]);

  const pendingReqs = mentorships.filter(r => r.status === 'pending');
  const acceptedReqs = mentorships.filter(r => r.status === 'accepted');
  const level = levelFromXp(profile?.xp || 0);
  const completion = profile ? profileCompletion(profile as unknown as Partial<Record<string, unknown>>) : 0;

  if (loading) return <DashboardLoader />;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Senior'}! 🎓`}
        description="Mentor juniors, share knowledge, and lead from the front."
      />

      {/* Role badge */}
      <div className="mb-6 flex items-center gap-2">
        <Badge className="flex items-center gap-1.5 px-3 py-1 text-sm bg-blue-600">
          <UserCheck className="h-3.5 w-3.5" />
          Senior Student · Semester {profile?.semester || 6} · {profile?.branch || 'Engineering'}
        </Badge>
        {profile?.college && <Badge variant="outline" className="text-sm">{profile.college}</Badge>}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="XP Points" value={profile?.xp || 0} icon={Zap} trend={`Level ${level}`} />
        <StatCard label="Mentees" value={acceptedReqs.length} icon={Users} />
        <StatCard label="Pending Requests" value={pendingReqs.length} icon={Bell} />
        <StatCard label="Notes Shared" value={myNotes.filter(n => n.status === 'approved').length} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          {/* Pending mentorship requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Mentorship Requests
                  {pendingReqs.length > 0 && (
                    <Badge variant="destructive" className="ml-1">{pendingReqs.length} new</Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/networking')}>Manage All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {pendingReqs.length === 0 ? (
                <div className="py-6 text-center">
                  <UserCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No pending requests. Keep building your profile!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReqs.slice(0, 3).map(req => (
                    <div key={req.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-amber-200">S</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">New mentorship request</span>
                        <span className="ml-auto text-xs text-muted-foreground">{timeAgo(req.created_at)}</span>
                      </div>
                      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{req.message}</p>
                      <Button size="sm" onClick={() => navigate('/networking')}>
                        <UserCheck className="mr-1 h-3.5 w-3.5" /> Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My shared notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Shared Notes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>
                  <PlusCircle className="mr-1 h-3.5 w-3.5" /> Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myNotes.length === 0 ? (
                <div className="py-6 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Share your knowledge — upload notes!</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/notes')}>Upload Notes</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNotes.map(note => (
                    <div key={note.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{note.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {note.subject} · {note.downloads} downloads · {note.likes} likes
                          </p>
                        </div>
                      </div>
                      <Badge variant={note.status === 'approved' ? 'default' : 'secondary'}>{note.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students to mentor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Discover Students
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/networking')}>View All</Button>
              </div>
              <CardDescription>Junior students who could benefit from your guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map(student => (
                  <div key={student.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {student.full_name?.charAt(0).toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground">{student.branch} · Sem {student.semester}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/networking')}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Profile card */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex flex-col items-center text-center">
                <Avatar className="mb-3 h-16 w-16">
                  <AvatarFallback className="bg-blue-600/10 text-blue-700 text-xl font-bold">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                <Badge className="mt-2 bg-blue-600">Senior Student</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-accent p-2">
                  <p className="text-lg font-bold text-primary">{profile?.xp || 0}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="rounded-lg bg-accent p-2">
                  <p className="text-lg font-bold">{level}</p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
                <div className="rounded-lg bg-accent p-2">
                  <p className="text-lg font-bold text-orange-500">{profile?.learning_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Profile</span><span>{completion}%</span>
                </div>
                <Progress value={completion} className="h-1.5" />
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate('/profile')}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((user, i) => (
                  <div key={user.id} className={`flex items-center gap-3 rounded-lg p-2 ${i === 0 ? 'bg-yellow-500/10' : i === 1 ? 'bg-gray-400/10' : i === 2 ? 'bg-orange-700/10' : ''}`}>
                    <span className={`w-5 text-center text-sm font-bold ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{user.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{user.id === session?.user.id ? 'You ⭐' : user.full_name}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">{user.xp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming hackathons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4" />Hackathons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hackathons.length === 0 ? (
                <p className="py-3 text-center text-xs text-muted-foreground">No upcoming events</p>
              ) : hackathons.map(hack => (
                <div key={hack.id} className="mb-2 cursor-pointer rounded-lg border p-2.5 text-xs hover:bg-accent/50" onClick={() => navigate('/hackathons')}>
                  <p className="font-medium">{hack.title}</p>
                  <p className="mt-0.5 text-muted-foreground">{new Date(hack.start_date).toLocaleDateString()}</p>
                  {hack.prize && <Badge variant="secondary" className="mt-1 text-xs">{hack.prize}</Badge>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate('/hackathons')}>
                All Hackathons
              </Button>
            </CardContent>
          </Card>

          {/* Community posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4" />Community
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>Post</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {myPosts.slice(0, 3).map(post => (
                  <div key={post.id} className="cursor-pointer rounded-lg border p-2.5 hover:bg-accent/50" onClick={() => navigate('/community')}>
                    <p className="text-xs font-medium line-clamp-1">{post.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>👍 {post.upvotes}</span>
                      <span>💬 {post.comment_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FACULTY / ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────
function FacultyDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, notes: 0, posts: 0, quizzes: 0, hackathons: 0, attempts: 0, registrations: 0, mentorships: 0 });
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, n, u, p, h] = await Promise.all([
        api.get('/api/admin/stats').then(r => r.data).catch(() => ({})),
        api.get('/api/admin/pending-notes').then(r => r.data).catch(() => []),
        api.get('/api/admin/users').then(r => r.data.slice(0, 5)).catch(() => []),
        api.get('/api/admin/posts').then(r => r.data.slice(0, 4)).catch(() => []),
        api.get('/api/admin/hackathons').then(r => r.data.slice(0, 3)).catch(() => []),
      ]);
      setStats(s);
      setPendingNotes(n);
      setRecentUsers(u);
      setRecentPosts(p);
      setHackathons(h);
      setLoading(false);
    };
    load();
  }, []);

  const approveNote = async (noteId: string, approved: boolean) => {
    if (approved) {
      await api.patch(`/api/admin/notes/${noteId}/approve`);
    } else {
      await api.patch(`/api/admin/notes/${noteId}/reject`);
    }
    const updated = await api.get('/api/admin/pending-notes');
    setPendingNotes(updated.data);
    const s = await api.get('/api/admin/stats');
    setStats(s.data);
  };

  if (loading) return <DashboardLoader />;

  return (
    <div>
      <PageHeader
        title={`Admin Panel — ${profile?.full_name?.split(' ')[0] || 'Faculty'} 🛡️`}
        description="Manage the platform, approve content, and monitor activity."
      />

      {/* Role badge */}
      <div className="mb-6 flex items-center gap-2">
        <Badge className="flex items-center gap-1.5 bg-purple-700 px-3 py-1 text-sm">
          <Shield className="h-3.5 w-3.5" />
          Faculty / Admin
        </Badge>
        {profile?.college && <Badge variant="outline" className="text-sm">{profile.college}</Badge>}
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate('/admin')}>
          Full Admin Panel →
        </Button>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.users} icon={Users} />
        <StatCard label="Pending Notes" value={stats.notes} icon={AlertCircle} trend={stats.notes > 0 ? 'Needs review' : 'All clear'} />
        <StatCard label="Quiz Attempts" value={stats.attempts} icon={ClipboardCheck} />
        <StatCard label="Forum Posts" value={stats.posts} icon={MessageSquare} />
        <StatCard label="Hackathons" value={stats.hackathons} icon={Trophy} />
        <StatCard label="Registrations" value={stats.registrations} icon={UserCheck} />
        <StatCard label="Mentorships" value={stats.mentorships} icon={Users} />
        <StatCard label="Active Quizzes" value={stats.quizzes} icon={BarChart2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          {/* Pending note approvals — most urgent */}
          <Card className={pendingNotes.length > 0 ? 'border-amber-300 bg-amber-50/30' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className={`h-4 w-4 ${pendingNotes.length > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  Pending Note Approvals
                  {pendingNotes.length > 0 && (
                    <Badge variant="destructive">{pendingNotes.length}</Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>Admin Panel</Button>
              </div>
            </CardHeader>
            <CardContent>
              {pendingNotes.length === 0 ? (
                <div className="flex items-center gap-3 py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs text-muted-foreground">No notes waiting for approval.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingNotes.slice(0, 4).map(note => (
                    <div key={note.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        <FileText className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{note.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {note.subject} · by {note.profiles?.full_name || 'Student'} · {timeAgo(note.created_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" onClick={() => approveNote(note.id, true)} className="h-7 bg-green-600 hover:bg-green-700 px-2">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => approveNote(note.id, false)} className="h-7 border-red-300 text-red-600 hover:bg-red-50 px-2">
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingNotes.length > 4 && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin')}>
                      View all {pendingNotes.length} pending notes
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />Recent Registrations
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>Manage</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs ${user.role === 'faculty' ? 'bg-purple-100 text-purple-700' : user.role === 'senior' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email} · {user.branch || 'No branch'}</p>
                    </div>
                    <Badge variant="outline" className="capitalize shrink-0">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Forum posts overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />Community Overview
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>View Forum</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPosts.map(post => (
                  <div key={post.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarFallback className="text-xs">{post.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs capitalize">{post.category}</Badge>
                        <span>👍 {post.upvotes}</span>
                        <span>💬 {post.comment_count}</span>
                        <span className="ml-auto">{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Faculty profile card */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex flex-col items-center text-center">
                <Avatar className="mb-3 h-16 w-16">
                  <AvatarFallback className="bg-purple-700/10 text-purple-800 text-xl font-bold">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'F'}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                <Badge className="mt-2 bg-purple-700">Faculty · Admin</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full mb-2" onClick={() => navigate('/admin')}>
                <Shield className="mr-1.5 h-3.5 w-3.5" /> Full Admin Panel
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/profile')}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick admin actions */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Add Quiz', icon: ClipboardCheck, path: '/quizzes' },
                  { label: 'Post Announcement', icon: Bell, path: '/community' },
                  { label: 'Add Resource', icon: BookOpen, path: '/resources' },
                  { label: 'Create Hackathon', icon: Trophy, path: '/hackathons' },
                  { label: 'Manage Users', icon: Users, path: '/admin' },
                ].map(action => (
                  <button key={action.label} onClick={() => navigate(action.path)}
                    className="flex w-full items-center gap-3 rounded-lg border p-2.5 text-left text-sm transition-colors hover:bg-accent">
                    <action.icon className="h-4 w-4 text-primary" />
                    {action.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hackathons managed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4" />Hackathons
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/hackathons')}>
                  <PlusCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hackathons.length === 0 ? (
                <p className="py-3 text-center text-xs text-muted-foreground">No hackathons yet</p>
              ) : hackathons.map(hack => (
                <div key={hack.id} className="mb-2 rounded-lg border p-2.5">
                  <p className="text-xs font-medium">{hack.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(hack.start_date).toLocaleDateString()}
                    <span>· {hack.registration_count} registered</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SHARED: loading spinner
// ─────────────────────────────────────────────────────────────────
function DashboardLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ROUTER: picks the right dashboard based on role
// ─────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) return <DashboardLoader />;

  if (profile?.role === 'faculty') return <FacultyDashboard />;
  if (profile?.role === 'senior') return <SeniorDashboard />;
  return <StudentDashboard />;
}
