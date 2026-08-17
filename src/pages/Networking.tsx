import { useEffect, useState, useCallback } from 'react';
import { Users, Search, Loader2, GraduationCap, Send, Check, X, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, EmptyState } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BRANCHES, levelFromXp } from '@/lib/constants';
import type { Profile, MentorshipRequest } from '@/lib/types';

export function Networking() {
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<Profile | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*').neq('id', session?.user.id || '');
    if (branchFilter !== 'all') query = query.eq('branch', branchFilter);
    if (roleFilter !== 'all') query = query.eq('role', roleFilter);
    if (search) query = query.or(`full_name.ilike.%${search}%,skills.cs.{${search}}`);
    query = query.order('xp', { ascending: false }).limit(50);
    const { data } = await query;
    setUsers((data as Profile[]) || []);

    if (session) {
      const { data: reqs } = await supabase.from('mentorship_requests')
        .select('*').or(`junior_id.eq.${session.user.id},senior_id.eq.${session.user.id}`);
      setRequests((reqs as MentorshipRequest[]) || []);
    }
    setLoading(false);
  }, [session, branchFilter, roleFilter, search]);

  useEffect(() => { load(); }, [load]);

  const sendRequest = async () => {
    if (!session || !targetUser) return;
    await supabase.from('mentorship_requests').insert({
      junior_id: session.user.id,
      senior_id: targetUser.id,
      message,
    });
    await supabase.from('notifications').insert({
      user_id: targetUser.id,
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: `${profile?.full_name} requested mentorship`,
    });
    toast({ title: 'Mentorship request sent!' });
    setRequestOpen(false);
    setMessage('');
    load();
  };

  const updateRequest = async (req: MentorshipRequest, status: 'accepted' | 'rejected') => {
    await supabase.from('mentorship_requests').update({ status }).eq('id', req.id);
    load();
  };

  const hasRequest = (userId: string) => requests.some((r) => r.senior_id === userId && r.junior_id === session?.user.id);

  return (
    <div>
      <PageHeader title="Senior-Junior Networking" description="Connect with seniors, find mentors, and grow your network." />

      {/* Incoming requests */}
      {requests.filter((r) => r.senior_id === session?.user.id && r.status === 'pending').length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Award className="h-4 w-4" /> Pending Mentorship Requests</h3>
            <div className="space-y-3">
              {requests.filter((r) => r.senior_id === session?.user.id && r.status === 'pending').map((req) => (
                <div key={req.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar><AvatarFallback>{users.find((u) => u.id === req.junior_id)?.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{users.find((u) => u.id === req.junior_id)?.full_name || 'Student'}</p>
                    <p className="text-xs text-muted-foreground">{req.message}</p>
                  </div>
                  <Button size="sm" onClick={() => updateRequest(req, 'accepted')}><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => updateRequest(req, 'rejected')}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or skill..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="senior">Seniors</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try adjusting filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">{user.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{user.full_name}</p>
                    <Badge variant="outline" className="capitalize text-xs">{user.role}</Badge>
                  </div>
                </div>
                {user.bio && <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>}
                <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                  {user.college && <p>{user.college}</p>}
                  {user.branch && <p>{user.branch} · Sem {user.semester}</p>}
                  <p>Level {levelFromXp(user.xp)} · {user.xp} XP</p>
                </div>
                {user.skills && user.skills.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {user.skills.slice(0, 3).map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                )}
                <div className="border-t pt-3">
                  {hasRequest(user.id) ? (
                    <Badge variant="secondary" className="w-full justify-center">Request Sent</Badge>
                  ) : (
                    <Dialog open={requestOpen && targetUser?.id === user.id} onOpenChange={(o) => { setRequestOpen(o); if (o) setTargetUser(user); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => setTargetUser(user)}>
                          <Send className="mr-1 h-3.5 w-3.5" /> Request Mentorship
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Mentorship from {user.full_name}</DialogTitle>
                          <DialogDescription>Send a message explaining what you'd like help with.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, I'd like your guidance on..." rows={4} />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
                          <Button onClick={sendRequest}>Send Request</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
