import { useState } from 'react';
import { Save, Loader2, Plus, X, Github, Linkedin, Globe, Award, Flame, Zap, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRANCHES, DEPARTMENTS, levelFromXp, profileCompletion } from '@/lib/constants';

const ACHIEVEMENTS = [
  { name: 'First Note', condition: 'Upload your first note' },
  { name: 'Quiz Master', condition: 'Complete 5 quizzes' },
  { name: '7 Day Streak', condition: 'Maintain a 7-day streak' },
  { name: 'Helpful Senior', condition: 'Answer 10 doubts' },
  { name: 'Problem Solver', condition: 'Post 5 community discussions' },
  { name: 'Hackathon Participant', condition: 'Register for a hackathon' },
  { name: 'Career Builder', condition: 'Complete 50% of a roadmap' },
];

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    college: profile?.college || '',
    department: profile?.department || '',
    branch: profile?.branch || '',
    semester: String(profile?.semester || 1),
    graduation_year: String(profile?.graduation_year || ''),
    github: profile?.github || '',
    linkedin: profile?.linkedin || '',
    portfolio: profile?.portfolio || '',
    skills: profile?.skills || [],
    programming_languages: profile?.programming_languages || [],
    projects: profile?.projects || [],
    certifications: profile?.certifications || [],
    achievements: profile?.achievements || [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newCert, setNewCert] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: form.full_name,
      bio: form.bio,
      college: form.college,
      department: form.department,
      branch: form.branch,
      semester: parseInt(form.semester),
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      github: form.github,
      linkedin: form.linkedin,
      portfolio: form.portfolio,
      skills: form.skills,
      programming_languages: form.programming_languages,
      projects: form.projects,
      certifications: form.certifications,
      achievements: form.achievements,
    });
    if (error) {
      toast({ title: 'Failed to save', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
      setEditing(false);
    }
    setSaving(false);
  };

  const level = levelFromXp(profile?.xp || 0);
  const completion = profile ? profileCompletion(profile as unknown as Partial<Record<string, unknown>>) : 0;

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your academic and professional information.">
        {editing ? (
          <>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="mx-auto mb-4 h-24 w-24">
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{profile?.full_name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="mt-2 flex justify-center gap-2">
                <Badge variant="secondary" className="capitalize">{profile?.role}</Badge>
                {profile?.branch && <Badge variant="outline">{profile.branch}</Badge>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-accent p-3"><Zap className="mx-auto mb-1 h-4 w-4 text-primary" /><p className="text-lg font-bold">{profile?.xp || 0}</p><p className="text-xs text-muted-foreground">XP</p></div>
                <div className="rounded-lg bg-accent p-3"><Star className="mx-auto mb-1 h-4 w-4 text-primary" /><p className="text-lg font-bold">{level}</p><p className="text-xs text-muted-foreground">Level</p></div>
                <div className="rounded-lg bg-accent p-3"><Flame className="mx-auto mb-1 h-4 w-4 text-orange-500" /><p className="text-lg font-bold">{profile?.learning_streak || 0}</p><p className="text-xs text-muted-foreground">Streak</p></div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Profile Completion</span><span>{completion}%</span></div>
                <Progress value={completion} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><Award className="h-4 w-4" /> Achievements</h3>
              <div className="space-y-2">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = profile?.achievements?.includes(ach.name);
                  return (
                    <div key={ach.name} className={`flex items-center gap-3 rounded-lg border p-2 ${unlocked ? 'border-green-300 bg-green-50/30' : 'opacity-50'}`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${unlocked ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                        <Award className="h-4 w-4" />
                      </div>
                      <div><p className="text-sm font-medium">{ach.name}</p><p className="text-xs text-muted-foreground">{ach.condition}</p></div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="space-y-5 p-6">
              <h3 className="font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label>{editing ? <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /> : <p className="text-sm">{profile?.full_name || '—'}</p>}</div>
                <div className="space-y-2"><Label>Role</Label><p className="text-sm capitalize">{profile?.role}</p></div>
                <div className="space-y-2"><Label>College</Label>{editing ? <Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /> : <p className="text-sm">{profile?.college || '—'}</p>}</div>
                <div className="space-y-2"><Label>Department</Label>{editing ? (
                  <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                ) : <p className="text-sm">{profile?.department || '—'}</p>}</div>
                <div className="space-y-2"><Label>Branch</Label>{editing ? (
                  <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                ) : <p className="text-sm">{profile?.branch || '—'}</p>}</div>
                <div className="space-y-2"><Label>Semester</Label>{editing ? <Input type="number" min="1" max="8" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /> : <p className="text-sm">{profile?.semester || '—'}</p>}</div>
                <div className="space-y-2"><Label>Graduation Year</Label>{editing ? <Input type="number" value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} /> : <p className="text-sm">{profile?.graduation_year || '—'}</p>}</div>
              </div>

              <div className="space-y-2"><Label>Bio</Label>{editing ? <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /> : <p className="text-sm">{profile?.bio || '—'}</p>}</div>

              <div className="space-y-2">
                <Label>Social Links</Label>
                {editing ? (
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2"><Github className="h-4 w-4 text-muted-foreground" /><Input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="GitHub URL" /></div>
                    <div className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-muted-foreground" /><Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="LinkedIn URL" /></div>
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><Input value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} placeholder="Portfolio URL" /></div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {profile?.github && <a href={profile.github} target="_blank" rel="noreferrer"><Button size="icon" variant="outline"><Github className="h-4 w-4" /></Button></a>}
                    {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer"><Button size="icon" variant="outline"><Linkedin className="h-4 w-4" /></Button></a>}
                    {profile?.portfolio && <a href={profile.portfolio} target="_blank" rel="noreferrer"><Button size="icon" variant="outline"><Globe className="h-4 w-4" /></Button></a>}
                  </div>
                )}
              </div>

              {editing ? (
                <>
                  {[
                    { label: 'Skills', key: 'skills', newVal: newSkill, setNew: setNewSkill },
                    { label: 'Programming Languages', key: 'programming_languages', newVal: newLang, setNew: setNewLang },
                  ].map(({ label, key, newVal, setNew }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="flex gap-2">
                        <Input value={newVal} onChange={(e) => setNew(e.target.value)} placeholder={`Add ${label.toLowerCase()}`} onKeyDown={(e) => { if (e.key === 'Enter' && newVal) { setForm({ ...form, [key]: [...(form[key as keyof typeof form] as string[]), newVal] }); setNew(''); } }} />
                        <Button size="icon" onClick={() => { if (newVal) { setForm({ ...form, [key]: [...(form[key as keyof typeof form] as string[]), newVal] }); setNew(''); } }}><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(form[key as keyof typeof form] as string[]).map((s, i) => (
                          <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setForm({ ...form, [key]: (form[key as keyof typeof form] as string[]).filter((_, j) => j !== i) })}>{s} <X className="ml-1 h-3 w-3" /></Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {[
                    { label: 'Projects', key: 'projects', newVal: newProject, setNew: setNewProject },
                    { label: 'Certifications', key: 'certifications', newVal: newCert, setNew: setNewCert },
                    { label: 'Achievements', key: 'achievements', newVal: newAchievement, setNew: setNewAchievement },
                  ].map(({ label, key, newVal, setNew }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="flex gap-2">
                        <Input value={newVal} onChange={(e) => setNew(e.target.value)} placeholder={`Add ${label.toLowerCase()}`} />
                        <Button size="icon" onClick={() => { if (newVal) { setForm({ ...form, [key]: [...(form[key as keyof typeof form] as string[]), newVal] }); setNew(''); } }}><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="space-y-1">
                        {(form[key as keyof typeof form] as string[]).map((p, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                            <span>{p}</span>
                            <Button size="icon" variant="ghost" onClick={() => setForm({ ...form, [key]: (form[key as keyof typeof form] as string[]).filter((_, j) => j !== i) })}><X className="h-3 w-3" /></Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {profile?.skills && profile.skills.length > 0 && (<div className="space-y-2"><Label>Skills</Label><div className="flex flex-wrap gap-1">{profile.skills.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}</div></div>)}
                  {profile?.programming_languages && profile.programming_languages.length > 0 && (<div className="space-y-2"><Label>Programming Languages</Label><div className="flex flex-wrap gap-1">{profile.programming_languages.map((l, i) => <Badge key={i} variant="secondary">{l}</Badge>)}</div></div>)}
                  {profile?.projects && profile.projects.length > 0 && (<div className="space-y-2"><Label>Projects</Label><div className="space-y-1">{profile.projects.map((p, i) => <div key={i} className="rounded-lg border p-2 text-sm">{p}</div>)}</div></div>)}
                  {profile?.certifications && profile.certifications.length > 0 && (<div className="space-y-2"><Label>Certifications</Label><div className="space-y-1">{profile.certifications.map((c, i) => <div key={i} className="rounded-lg border p-2 text-sm">{c}</div>)}</div></div>)}
                  {profile?.achievements && profile.achievements.length > 0 && (<div className="space-y-2"><Label>Achievements</Label><div className="space-y-1">{profile.achievements.map((a, i) => <div key={i} className="rounded-lg border p-2 text-sm">{a}</div>)}</div></div>)}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
