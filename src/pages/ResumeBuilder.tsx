import { useEffect, useState, useCallback } from 'react';
import { FileUser, Plus, Save, Trash2, Loader2, Download, FileText } from 'lucide-react';
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
import type { Resume, ResumeData } from '@/lib/types';

const TEMPLATES = [
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'professional', label: 'Professional' },
  { value: 'developer', label: 'Developer' },
  { value: 'student', label: 'Student' },
  { value: 'internship', label: 'Internship' },
];

const emptyData: ResumeData = {
  personal: { name: '', email: '', phone: '', address: '', linkedin: '', github: '', portfolio: '' },
  objective: '',
  education: [],
  skills: [],
  projects: [],
  experience: [],
  internships: [],
  certifications: [],
  achievements: [],
  positions: [],
  social: { linkedin: '', github: '', portfolio: '' },
};

export function ResumeBuilder() {
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Resume | null>(null);
  const [data, setData] = useState<ResumeData>(emptyData);
  const [template, setTemplate] = useState('modern');
  const [name, setName] = useState('My Resume');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data: r } = await supabase.from('resumes').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false });
    setResumes((r as Resume[]) || []);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setEditing(null);
    setData({
      ...emptyData,
      personal: {
        ...emptyData.personal!,
        name: profile?.full_name || '',
        email: profile?.email || '',
        linkedin: profile?.linkedin || '',
        github: profile?.github || '',
        portfolio: profile?.portfolio || '',
      },
      skills: profile?.skills || [],
      achievements: profile?.achievements || [],
    });
    setTemplate('modern');
    setName('My Resume');
  };

  const editResume = (r: Resume) => {
    setEditing(r);
    setData(r.data || emptyData);
    setTemplate(r.template);
    setName(r.name);
  };

  const save = async () => {
    if (!session) return;
    setSaving(true);
    try {
      if (editing) {
        await supabase.from('resumes').update({ name, template, data }).eq('id', editing.id);
      } else {
        await supabase.from('resumes').insert({ user_id: session.user.id, name, template, data });
      }
      toast({ title: 'Resume saved!' });
      setEditing(null);
      load();
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    await supabase.from('resumes').delete().eq('id', id);
    load();
  };

  if (editing || (name !== 'My Resume' && data.personal?.name)) {
    const isEditing = editing !== null;
    return (
      <div>
        <PageHeader title={isEditing ? 'Edit Resume' : 'New Resume'} description={`Template: ${TEMPLATES.find((t) => t.value === template)?.label}`}>
          <Button variant="outline" onClick={() => { setEditing(null); setName('My Resume'); }}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-5">
                <h3 className="font-semibold">Resume Name & Template</h3>
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <h3 className="font-semibold">Personal Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Name</Label><Input value={data.personal?.name || ''} onChange={(e) => setData({ ...data, personal: { ...data.personal!, name: e.target.value } })} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={data.personal?.email || ''} onChange={(e) => setData({ ...data, personal: { ...data.personal!, email: e.target.value } })} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={data.personal?.phone || ''} onChange={(e) => setData({ ...data, personal: { ...data.personal!, phone: e.target.value } })} /></div>
                  <div className="space-y-2"><Label>Address</Label><Input value={data.personal?.address || ''} onChange={(e) => setData({ ...data, personal: { ...data.personal!, address: e.target.value } })} /></div>
                  <div className="space-y-2"><Label>LinkedIn</Label><Input value={data.personal?.linkedin || ''} onChange={(e) => setData({ ...data, personal: { ...data.personal!, linkedin: e.target.value } })} /></div>
                  <div className="space-y-2"><Label>GitHub</Label><Input value={data.personal?.github || ''} onChange={(e) => setData({ ...data, personal: { ...data.personal!, github: e.target.value } })} /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <h3 className="font-semibold">Career Objective</h3>
                <Textarea value={data.objective || ''} onChange={(e) => setData({ ...data, objective: e.target.value })} placeholder="Your career objective..." rows={3} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Skills</h3>
                  <Button size="sm" variant="outline" onClick={() => setData({ ...data, skills: [...(data.skills || []), ''] })}><Plus className="h-4 w-4" /></Button>
                </div>
                {(data.skills || []).map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={s} onChange={(e) => setData({ ...data, skills: data.skills!.map((sk, j) => j === i ? e.target.value : sk) })} />
                    <Button size="icon" variant="ghost" onClick={() => setData({ ...data, skills: data.skills!.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Education</h3>
                  <Button size="sm" variant="outline" onClick={() => setData({ ...data, education: [...(data.education || []), { institution: '', degree: '', field: '', start: '', end: '', gpa: '' }] })}><Plus className="h-4 w-4" /></Button>
                </div>
                {(data.education || []).map((edu, i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-3">
                    <div className="flex justify-end"><Button size="icon" variant="ghost" onClick={() => setData({ ...data, education: data.education!.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button></div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Institution" value={edu.institution} onChange={(e) => setData({ ...data, education: data.education!.map((ed, j) => j === i ? { ...ed, institution: e.target.value } : ed) })} />
                      <Input placeholder="Degree" value={edu.degree} onChange={(e) => setData({ ...data, education: data.education!.map((ed, j) => j === i ? { ...ed, degree: e.target.value } : ed) })} />
                      <Input placeholder="Field" value={edu.field} onChange={(e) => setData({ ...data, education: data.education!.map((ed, j) => j === i ? { ...ed, field: e.target.value } : ed) })} />
                      <Input placeholder="GPA" value={edu.gpa} onChange={(e) => setData({ ...data, education: data.education!.map((ed, j) => j === i ? { ...ed, gpa: e.target.value } : ed) })} />
                      <Input placeholder="Start" value={edu.start} onChange={(e) => setData({ ...data, education: data.education!.map((ed, j) => j === i ? { ...ed, start: e.target.value } : ed) })} />
                      <Input placeholder="End" value={edu.end} onChange={(e) => setData({ ...data, education: data.education!.map((ed, j) => j === i ? { ...ed, end: e.target.value } : ed) })} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Projects</h3>
                  <Button size="sm" variant="outline" onClick={() => setData({ ...data, projects: [...(data.projects || []), { title: '', description: '', link: '', technologies: '' }] })}><Plus className="h-4 w-4" /></Button>
                </div>
                {(data.projects || []).map((p, i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-3">
                    <div className="flex justify-end"><Button size="icon" variant="ghost" onClick={() => setData({ ...data, projects: data.projects!.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button></div>
                    <Input placeholder="Title" value={p.title} onChange={(e) => setData({ ...data, projects: data.projects!.map((pr, j) => j === i ? { ...pr, title: e.target.value } : pr) })} />
                    <Textarea placeholder="Description" value={p.description} onChange={(e) => setData({ ...data, projects: data.projects!.map((pr, j) => j === i ? { ...pr, description: e.target.value } : pr) })} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Technologies" value={p.technologies} onChange={(e) => setData({ ...data, projects: data.projects!.map((pr, j) => j === i ? { ...pr, technologies: e.target.value } : pr) })} />
                      <Input placeholder="Link" value={p.link} onChange={(e) => setData({ ...data, projects: data.projects!.map((pr, j) => j === i ? { ...pr, link: e.target.value } : pr) })} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Experience</h3>
                  <Button size="sm" variant="outline" onClick={() => setData({ ...data, experience: [...(data.experience || []), { company: '', role: '', start: '', end: '', description: '' }] })}><Plus className="h-4 w-4" /></Button>
                </div>
                {(data.experience || []).map((exp, i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-3">
                    <div className="flex justify-end"><Button size="icon" variant="ghost" onClick={() => setData({ ...data, experience: data.experience!.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button></div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Company" value={exp.company} onChange={(e) => setData({ ...data, experience: data.experience!.map((ex, j) => j === i ? { ...ex, company: e.target.value } : ex) })} />
                      <Input placeholder="Role" value={exp.role} onChange={(e) => setData({ ...data, experience: data.experience!.map((ex, j) => j === i ? { ...ex, role: e.target.value } : ex) })} />
                      <Input placeholder="Start" value={exp.start} onChange={(e) => setData({ ...data, experience: data.experience!.map((ex, j) => j === i ? { ...ex, start: e.target.value } : ex) })} />
                      <Input placeholder="End" value={exp.end} onChange={(e) => setData({ ...data, experience: data.experience!.map((ex, j) => j === i ? { ...ex, end: e.target.value } : ex) })} />
                    </div>
                    <Textarea placeholder="Description" value={exp.description} onChange={(e) => setData({ ...data, experience: data.experience!.map((ex, j) => j === i ? { ...ex, description: e.target.value } : ex) })} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Certifications</h3>
                  <Button size="sm" variant="outline" onClick={() => setData({ ...data, certifications: [...(data.certifications || []), { title: '', issuer: '', date: '' }] })}><Plus className="h-4 w-4" /></Button>
                </div>
                {(data.certifications || []).map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Title" value={c.title} onChange={(e) => setData({ ...data, certifications: data.certifications!.map((cf, j) => j === i ? { ...cf, title: e.target.value } : cf) })} />
                    <Input placeholder="Issuer" value={c.issuer} onChange={(e) => setData({ ...data, certifications: data.certifications!.map((cf, j) => j === i ? { ...cf, issuer: e.target.value } : cf) })} />
                    <Input placeholder="Date" value={c.date} onChange={(e) => setData({ ...data, certifications: data.certifications!.map((cf, j) => j === i ? { ...cf, date: e.target.value } : cf) })} />
                    <Button size="icon" variant="ghost" onClick={() => setData({ ...data, certifications: data.certifications!.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Achievements</h3>
                  <Button size="sm" variant="outline" onClick={() => setData({ ...data, achievements: [...(data.achievements || []), ''] })}><Plus className="h-4 w-4" /></Button>
                </div>
                {(data.achievements || []).map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={a} onChange={(e) => setData({ ...data, achievements: data.achievements!.map((ac, j) => j === i ? e.target.value : ac) })} />
                    <Button size="icon" variant="ghost" onClick={() => setData({ ...data, achievements: data.achievements!.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <Card className="bg-white">
              <CardContent className="p-8">
                <div className="border-b-2 border-primary pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{data.personal?.name || 'Your Name'}</h2>
                  <p className="text-sm text-gray-600">{data.personal?.email}{data.personal?.phone ? ` · ${data.personal.phone}` : ''}</p>
                  <p className="text-sm text-gray-600">{[data.personal?.linkedin, data.personal?.github, data.personal?.portfolio].filter(Boolean).join(' · ')}</p>
                </div>
                {data.objective && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Objective</h3>
                    <p className="text-sm text-gray-700">{data.objective}</p>
                  </div>
                )}
                {(data.education || []).length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Education</h3>
                    {(data.education || []).map((edu, i) => (
                      <div key={i} className="mb-2 text-sm">
                        <p className="font-medium text-gray-900">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                        <p className="text-gray-700">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
                        <p className="text-xs text-gray-500">{edu.start} - {edu.end}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(data.skills || []).filter(Boolean).length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {(data.skills || []).filter(Boolean).map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {(data.projects || []).length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Projects</h3>
                    {(data.projects || []).map((p, i) => (
                      <div key={i} className="mb-2 text-sm">
                        <p className="font-medium text-gray-900">{p.title}{p.technologies ? ` · ${p.technologies}` : ''}</p>
                        <p className="text-gray-700">{p.description}</p>
                        {p.link && <p className="text-xs text-primary">{p.link}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {(data.experience || []).length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Experience</h3>
                    {(data.experience || []).map((exp, i) => (
                      <div key={i} className="mb-2 text-sm">
                        <p className="font-medium text-gray-900">{exp.role}{exp.company ? `, ${exp.company}` : ''}</p>
                        <p className="text-xs text-gray-500">{exp.start} - {exp.end}</p>
                        <p className="text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(data.certifications || []).length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Certifications</h3>
                    {(data.certifications || []).map((c, i) => (
                      <p key={i} className="text-sm text-gray-700">{c.title} - {c.issuer} ({c.date})</p>
                    ))}
                  </div>
                )}
                {(data.achievements || []).filter(Boolean).length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Achievements</h3>
                    <ul className="list-inside list-disc text-sm text-gray-700">
                      {(data.achievements || []).filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            <Button className="mt-3 w-full" variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" /> Export PDF (Print)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Resume Builder" description="Create professional resumes with live preview.">
        <Button onClick={startNew}><Plus className="mr-2 h-4 w-4" /> New Resume</Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : resumes.length === 0 ? (
        <EmptyState icon={FileUser} title="No resumes yet" description="Create your first professional resume." action={<Button onClick={startNew}><Plus className="mr-2 h-4 w-4" /> New Resume</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <Card key={r.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">{TEMPLATES.find((t) => t.value === r.template)?.label || r.template}</Badge>
                </div>
                <h3 className="mb-1 font-semibold">{r.name}</h3>
                <p className="mb-4 text-xs text-muted-foreground">Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editResume(r)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
