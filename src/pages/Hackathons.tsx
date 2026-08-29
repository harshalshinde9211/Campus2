import { useEffect, useState, useCallback } from 'react';
import { Trophy, Plus, Calendar, MapPin, Users, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import type { Hackathon, HackathonRegistration } from '@/lib/types';

export function Hackathons() {
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<HackathonRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', organizer: '', startDate: '', endDate: '', location: 'Online', websiteUrl: '', prize: '', maxTeamSize: '4' });

  const isFaculty = profile?.role === 'faculty';

  const load = useCallback(async () => {
    setLoading(true);
    const [h, r] = await Promise.all([
      api.get('/api/hackathons').then(r => r.data).catch(() => []),
      session ? api.get('/api/hackathons/registrations/mine').then(r => r.data).catch(() => []) : Promise.resolve([]),
    ]);
    setHackathons(h);
    setRegistrations(r);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const isRegistered = (hackId: string) => registrations.some((r) => r.hackathon_id === hackId);

  const register = async (hackId: string) => {
    if (!session) return;
    try {
      await api.post(`/api/hackathons/${hackId}/register`);
      toast({ title: 'Registered! +50 XP' });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg === 'Already registered') toast({ title: 'Already registered' });
    }
  };

  const handleCreate = async () => {
    if (!session) return;
    try {
      await api.post('/api/hackathons', {
        title: form.title,
        description: form.description,
        organizer: form.organizer,
        start_date: new Date(form.startDate).toISOString(),
        end_date: new Date(form.endDate).toISOString(),
        location: form.location,
        website_url: form.websiteUrl,
        prize: form.prize,
        max_team_size: parseInt(form.maxTeamSize),
      });
      toast({ title: 'Hackathon created!' });
      setCreateOpen(false);
      setForm({ title: '', description: '', organizer: '', startDate: '', endDate: '', location: 'Online', websiteUrl: '', prize: '', maxTeamSize: '4' });
      load();
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const now = new Date();

  return (
    <div>
      <PageHeader title="Hackathon Hub" description="Discover, register, and participate in hackathons.">
        {isFaculty && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Create Hackathon</Button></DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Hackathon</DialogTitle><DialogDescription>Add a new hackathon event.</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Organizer</Label><Input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Start Date</Label><Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>End Date</Label><Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Prize</Label><Input value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Max Team Size</Label><Input type="number" value={form.maxTeamSize} onChange={(e) => setForm({ ...form, maxTeamSize: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Website URL</Label><Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!form.title || !form.startDate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : hackathons.length === 0 ? (
        <EmptyState icon={Trophy} title="No hackathons yet" description="Check back later for upcoming events." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hack) => {
            const upcoming = new Date(hack.start_date) > now;
            const ongoing = new Date(hack.start_date) <= now && new Date(hack.end_date) >= now;
            const registered = isRegistered(hack.id);
            return (
              <Card key={hack.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Trophy className="h-5 w-5 text-primary" /></div>
                    <Badge variant={ongoing ? 'default' : upcoming ? 'secondary' : 'outline'}>{ongoing ? 'Ongoing' : upcoming ? 'Upcoming' : 'Ended'}</Badge>
                  </div>
                  <h3 className="mb-1 font-semibold">{hack.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{hack.description}</p>
                  <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(hack.start_date).toLocaleDateString()} - {new Date(hack.end_date).toLocaleDateString()}</p>
                    <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{hack.location}</p>
                    <p className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{hack.registration_count} registered · Max {hack.max_team_size}</p>
                    {hack.prize && <p className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />Prize: {hack.prize}</p>}
                  </div>
                  <div className="mt-auto flex items-center gap-2 border-t pt-3">
                    {registered ? (
                      <Badge className="flex-1 justify-center"><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Registered</Badge>
                    ) : upcoming ? (
                      <Button size="sm" className="flex-1" onClick={() => register(hack.id)}>Register</Button>
                    ) : null}
                    {hack.website_url && (
                      <Button size="sm" variant="outline" onClick={() => window.open(hack.website_url, '_blank')}><ExternalLink className="h-3.5 w-3.5" /></Button>
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
