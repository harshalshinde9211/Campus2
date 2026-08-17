import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ClipboardCheck, FileUser, Map, Briefcase,
  Users, Trophy, MessageSquare, Flame, Star, TrendingUp,
  BookOpen, Award, Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader, StatCard } from '@/components/PageHeader';
import { levelFromXp, profileCompletion, timeAgo } from '@/lib/constants';
import type { Note, QuizAttempt, CommunityPost, Hackathon, Profile } from '@/lib/types';

interface Activity {
  type: string;
  title: string;
  time: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [upcomingHackathons, setUpcomingHackathons] = useState<Hackathon[]>([]);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const [notes, attempts, posts, hacks, leaders] = await Promise.all([
        supabase
          .from('notes')
          .select('*, profiles!inner(id, full_name, avatar_url, branch, semester)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('community_posts')
          .select('*, profiles!inner(id, full_name, avatar_url)')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('hackathons')
          .select('*')
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(3),
        supabase
          .from('profiles')
          .select('*')
          .order('xp', { ascending: false })
          .limit(5),
      ]);

      setRecentNotes((notes.data as unknown as Note[]) || []);
      setQuizAttempts((attempts.data as QuizAttempt[]) || []);
      setRecentPosts((posts.data as unknown as CommunityPost[]) || []);
      setUpcomingHackathons((hacks.data as Hackathon[]) || []);
      setLeaderboard((leaders.data as Profile[]) || []);

      const acts: Activity[] = [];
      (notes.data as unknown as Note[] || []).forEach((n) =>
        acts.push({ type: 'note', title: `Uploaded "${n.title}"`, time: n.created_at })
      );
      (attempts.data as QuizAttempt[] || []).forEach((a) =>
        acts.push({ type: 'quiz', title: `Scored ${a.percentage}% on quiz`, time: a.created_at })
      );
      (posts.data as unknown as CommunityPost[] || []).forEach((p) =>
        acts.push({ type: 'post', title: `Posted "${p.title}"`, time: p.created_at })
      );
      acts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(acts.slice(0, 6));

      setLoading(false);
    };
    load();
  }, [session]);

  const completion = profile ? profileCompletion(profile) : 0;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Student'}!`}
        description="Here's what's happening in your academic journey."
      />

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="XP Points"
          value={profile?.xp || 0}
          icon={Zap}
          trend={`Level ${level}`}
        />
        <StatCard
          label="Learning Streak"
          value={`${profile?.learning_streak || 0} days`}
          icon={Flame}
        />
        <StatCard
          label="Profile Complete"
          value={`${completion}%`}
          icon={Star}
        />
        <StatCard
          label="Quiz Attempts"
          value={quizAttempts.length}
          icon={ClipboardCheck}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>Complete your profile to unlock all features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{completion}% complete</span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
              </div>
              <Progress value={completion} className="h-2" />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-primary hover:bg-accent"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-center text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Notes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No notes uploaded yet. <button onClick={() => navigate('/notes')} className="text-primary hover:underline">Upload one</button>
                </p>
              ) : (
                <div className="space-y-3">
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{note.title}</p>
                          <p className="text-xs text-muted-foreground">{note.subject}</p>
                        </div>
                      </div>
                      <Badge variant={note.status === 'approved' ? 'default' : 'secondary'}>
                        {note.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Quiz Attempts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Quizzes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/quizzes')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {quizAttempts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No quizzes taken yet. <button onClick={() => navigate('/quizzes')} className="text-primary hover:underline">Take a quiz</button>
                </p>
              ) : (
                <div className="space-y-3">
                  {quizAttempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <ClipboardCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{attempt.score}/{attempt.total_questions} correct</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(attempt.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{Number(attempt.percentage).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No data yet</p>
                ) : (
                  leaderboard.map((user, i) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 rounded-lg p-2 ${
                        i === 0 ? 'bg-yellow-500/10' : i === 1 ? 'bg-gray-400/10' : i === 2 ? 'bg-orange-700/10' : ''
                      }`}
                    >
                      <span className={`w-5 text-center text-sm font-bold ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {user.id === session?.user.id ? 'You' : user.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">Level {levelFromXp(user.xp)}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{user.xp}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Hackathons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Upcoming Hackathons
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingHackathons.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No upcoming hackathons</p>
              ) : (
                <div className="space-y-3">
                  {upcomingHackathons.map((hack) => (
                    <div
                      key={hack.id}
                      className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent/50"
                      onClick={() => navigate('/hackathons')}
                    >
                      <p className="text-sm font-medium">{hack.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(hack.start_date).toLocaleDateString()}
                      </p>
                      {hack.prize && (
                        <Badge variant="secondary" className="mt-2">{hack.prize}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent">
                        {act.type === 'note' ? (
                          <BookOpen className="h-3.5 w-3.5 text-accent-foreground" />
                        ) : act.type === 'quiz' ? (
                          <ClipboardCheck className="h-3.5 w-3.5 text-accent-foreground" />
                        ) : (
                          <MessageSquare className="h-3.5 w-3.5 text-accent-foreground" />
                        )}
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
