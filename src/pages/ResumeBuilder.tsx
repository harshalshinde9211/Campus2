import { useEffect, useState, useCallback } from 'react';
import { FileUser, Plus, Save, Trash2, Loader2, Download, FileText } from 'lucide-react';
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
  const [isNew, setIsNew] = useState(false);
  const [data, setData] = useState<ResumeData>(emptyData);
  const [template, setTemplate] = useState('modern');
  const [name, setName] = useState('My Resume');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data: r } = await api.get('/api/resumes');
    setResumes(r || []);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setEditing(null);
    setIsNew(true);
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
    setIsNew(true);
    setData(r.data || emptyData);
    setTemplate(r.template);
    setName(r.name);
  };

  const save = async () => {
    if (!session) return;
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/api/resumes/${editing.id}`, { name, template, data });
      } else {
        await api.post('/api/resumes', { name, template, data });
      }
      toast({ title: 'Resume saved!' });
      setEditing(null);
      setIsNew(false);
      load();
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    await api.delete(`/api/resumes/${id}`);
    load();
  };

  if (isNew) {
    return (
      <div>
        <PageHeader title={editing ? 'Edit Resume' : 'New Resume'} description={`Template: ${TEMPLATES.find((t) => t.value === template)?.label}`}>
          <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false); }}>Cancel</Button>
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
                  {(['name', 'email', 'phone', 'address', 'linkedin', 'github'] as const).map((field) => (
                    <div key={field} className="space-y-2">
                      <Label className="capitalize">{field}</Label>
                      <Input value={data.personal?.[field] || ''} onChange={(e) => setData({ ...data, personal: { ...data.personal!, [field]: e.target.value } })} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5">
                <h3 className="font-semibold">Career Objective</h3>
                <Textarea value={data.objective || ''} onChange={(e) => setData({ ...data, objective: e.target.value })} rows={3} />
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
                      {(['institution', 'degree', 'field', 'gpa', 'start', 'end'] as const).map((f) => (
                        <Input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={edu[f]} onChange={(e) => setData({ ...data, education: data.education!.map((ed, j) => j === i ? { ...ed, [f]: e.target.value } : ed) })} />
                      ))}
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
                {data.objective && (<div className="mt-4"><h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Objective</h3><p className="text-sm text-gray-700">{data.objective}</p></div>)}
                {(data.education || []).length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Education</h3>
                    {(data.education || []).map((edu, i) => (<div key={i} className="mb-2 text-sm"><p className="font-medium text-gray-900">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p><p className="text-gray-700">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p><p className="text-xs text-gray-500">{edu.start} - {edu.end}</p></div>))}
                  </div>
                )}
                {(data.skills || []).filter(Boolean).length > 0 && (
                  <div className="mt-4"><h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Skills</h3><div className="flex flex-wrap gap-1">{(data.skills || []).filter(Boolean).map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div></div>
                )}
                {(data.projects || []).length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Projects</h3>
                    {(data.projects || []).map((p, i) => (<div key={i} className="mb-2 text-sm"><p className="font-medium text-gray-900">{p.title}{p.technologies ? ` · ${p.technologies}` : ''}</p><p className="text-gray-700">{p.description}</p>{p.link && <p className="text-xs text-primary">{p.link}</p>}</div>))}
                  </div>
                )}
                {(data.certifications || []).length > 0 && (
                  <div className="mt-4"><h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Certifications</h3>{(data.certifications || []).map((c, i) => (<p key={i} className="text-sm text-gray-700">{c.title} - {c.issuer} ({c.date})</p>))}</div>
                )}
                {(data.achievements || []).filter(Boolean).length > 0 && (
                  <div className="mt-4"><h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">Achievements</h3><ul className="list-inside list-disc text-sm text-gray-700">{(data.achievements || []).filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}</ul></div>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
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
