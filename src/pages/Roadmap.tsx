import { useEffect, useState, useCallback } from 'react';
import { Map, Loader2, CheckCircle2, Circle, Clock, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CAREER_OPTIONS } from '@/lib/constants';
import type { CareerRoadmap, RoadmapProgress, RoadmapTask } from '@/lib/types';

export function Roadmap() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [progress, setProgress] = useState<RoadmapProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoadmaps = async () => {
      const { data } = await supabase.from('career_roadmaps').select('*').order('career_name');
      setRoadmaps((data as CareerRoadmap[]) || []);
      if ((data as CareerRoadmap[])?.length > 0) setSelected(data[0].career_key);
      setLoading(false);
    };
    loadRoadmaps();
  }, []);

  const loadProgress = useCallback(async (careerKey: string) => {
    if (!session) return;
    const { data } = await supabase
      .from('roadmap_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('career_key', careerKey);
    setProgress((data as RoadmapProgress[]) || []);
  }, [session]);

  useEffect(() => {
    if (selected) {
      setRoadmap(roadmaps.find((r) => r.career_key === selected) || null);
      loadProgress(selected);
    }
  }, [selected, roadmaps, loadProgress]);

  const getTaskStatus = (taskId: string): 'not_started' | 'in_progress' | 'completed' => {
    const p = progress.find((pr) => pr.task_id === taskId);
    return p?.status || 'not_started';
  };

  const cycleStatus = async (task: RoadmapTask) => {
    if (!session || !selected) return;
    const current = getTaskStatus(task.id);
    const next = current === 'not_started' ? 'in_progress' : current === 'in_progress' ? 'completed' : 'not_started';

    const existing = progress.find((p) => p.task_id === task.id);
    if (existing) {
      await supabase.from('roadmap_progress').update({ status: next }).eq('id', existing.id);
    } else {
      await supabase.from('roadmap_progress').insert({
        user_id: session.user.id,
        career_key: selected,
        task_id: task.id,
        status: next,
      });
    }

    if (next === 'completed') {
      await supabase.from('profiles').update({ xp: (await supabase.from('profiles').select('xp').eq('id', session.user.id).single()).data?.xp + 15 }).eq('id', session.user.id);
      toast({ title: 'Task completed! +15 XP' });
    }

    loadProgress(selected);
  };

  const totalTasks = roadmap?.phases.reduce((sum, p) => sum + p.tasks.length, 0) || 0;
  const completedTasks = roadmap?.phases.reduce((sum, p) => sum + p.tasks.filter((t) => getTaskStatus(t.id) === 'completed').length, 0) || 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <PageHeader title="Career Roadmap" description="Follow a structured path to your dream career.">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select career" /></SelectTrigger>
          <SelectContent>
            {CAREER_OPTIONS.map((c) => <SelectItem key={c.key} value={c.key}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </PageHeader>

      {roadmap && (
        <>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{roadmap.career_name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{roadmap.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{progressPct}%</p>
                  <p className="text-xs text-muted-foreground">{completedTasks}/{totalTasks} tasks</p>
                </div>
              </div>
              <Progress value={progressPct} className="h-3" />
            </CardContent>
          </Card>

          {/* 30/60/90 Day Overview */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /><span className="text-sm font-semibold">30 Days</span></div>
                <p className="text-xs text-muted-foreground">Foundation skills</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /><span className="text-sm font-semibold">60 Days</span></div>
                <p className="text-xs text-muted-foreground">Core development + projects</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2"><Target className="h-4 w-4 text-orange-500" /><span className="text-sm font-semibold">90 Days</span></div>
                <p className="text-xs text-muted-foreground">Advanced + interview prep</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {roadmap.phases.map((phase) => {
              const phaseTotal = phase.tasks.length;
              const phaseCompleted = phase.tasks.filter((t) => getTaskStatus(t.id) === 'completed').length;
              return (
                <Card key={phase.phase}>
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                          {phase.phase}
                        </div>
                        <div>
                          <h3 className="font-semibold">{phase.title}</h3>
                          <p className="text-xs text-muted-foreground">{phaseCompleted}/{phaseTotal} completed</p>
                        </div>
                      </div>
                      <Progress value={phaseTotal > 0 ? (phaseCompleted / phaseTotal) * 100 : 0} className="h-2 w-24" />
                    </div>
                    <div className="space-y-2">
                      {phase.tasks.map((task) => {
                        const status = getTaskStatus(task.id);
                        return (
                          <button
                            key={task.id}
                            onClick={() => cycleStatus(task)}
                            className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50 ${
                              status === 'completed' ? 'border-green-300 bg-green-50/30' : status === 'in_progress' ? 'border-blue-300 bg-blue-50/30' : ''
                            }`}
                          >
                            {status === 'completed' ? (
                              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                            ) : status === 'in_progress' ? (
                              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                            ) : (
                              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                                <Badge variant="outline" className="text-xs capitalize">{task.priority}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span>Skill: {task.skill}</span>
                                <span>·</span>
                                <span>Duration: {task.duration}</span>
                                <span>·</span>
                                <span className="capitalize">Difficulty: {task.difficulty}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
