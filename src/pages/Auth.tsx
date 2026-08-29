import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Loader2, Eye, EyeOff,
  User, Mail, Lock, Phone,
  Briefcase, Users, Shield,
  ChevronRight, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { UserRole } from '@/lib/types';

const DESIGNATIONS = [
  'Professor', 'Associate Professor', 'Assistant Professor',
  'Lecturer', 'HOD', 'Lab Instructor', 'Research Scholar', 'Other',
];

// ── Role card definitions ─────────────────────────────────────
const ROLES: { value: UserRole; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  {
    value: 'student',
    label: 'Student',
    desc: 'Undergraduate / postgraduate learner',
    icon: GraduationCap,
    color: 'border-blue-400 bg-blue-50 text-blue-700',
  },
  {
    value: 'senior',
    label: 'Senior Student',
    desc: 'Final-year student & peer mentor',
    icon: Users,
    color: 'border-green-400 bg-green-50 text-green-700',
  },
  {
    value: 'faculty',
    label: 'Faculty / Admin',
    desc: 'Professor or administrator',
    icon: Shield,
    color: 'border-purple-400 bg-purple-50 text-purple-700',
  },
];

// ── Small reusable field wrapper ──────────────────────────────
function Field({
  label, icon: Icon, error, children,
}: {
  label: string;
  icon?: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Login fields ──────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ── Signup fields ─────────────────────────────────────────
  const [role, setRole] = useState<UserRole>('student');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    // faculty only
    employee_id: '',
    designation: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({});

  const set = (key: keyof typeof form, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setFieldErrors(e => ({ ...e, [key]: '' }));
    setGlobalError('');
  };

  // ── Login submit ──────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!loginEmail.trim()) { setGlobalError('Email is required'); return; }
    if (!loginPassword)     { setGlobalError('Password is required'); return; }
    setLoading(true);
    const { error } = await signIn(loginEmail.trim(), loginPassword);
    if (error) { setGlobalError(error); setLoading(false); }
    else        { navigate('/dashboard'); }
  };

  const validateSignup = () => {
    const errs: Partial<typeof form> = {};
    if (!form.full_name.trim())  errs.full_name       = 'Full name is required';
    if (!form.email.trim())      errs.email           = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password)          errs.password        = 'Password is required';
    else if (form.password.length < 6) errs.password  = 'Minimum 6 characters';
    if (form.password !== form.confirm_password)
      errs.confirm_password = 'Passwords do not match';
    if (role === 'faculty' && !form.employee_id.trim())
      errs.employee_id = 'Employee ID is required';
    if (role === 'faculty' && !form.designation)
      errs.designation = 'Select your designation';
    return errs;
  };

  // ── Signup submit ─────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    const errs = validateSignup();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true);
    const { error } = await signUp(
      form.email.trim(),
      form.password,
      form.full_name.trim(),
      role,
      {
        phone:       form.phone,
        employee_id: form.employee_id,
        designation: form.designation,
      }
    );
    if (error) {
      setGlobalError(error);
      setLoading(false);
    } else {
      setSuccess('Account created! Redirecting to your dashboard…');
      setTimeout(() => navigate('/dashboard'), 1200);
    }
  };

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m);
    setGlobalError('');
    setSuccess('');
    setFieldErrors({});
  };

  // ── Role accent colour ────────────────────────────────────
  const roleAccent = role === 'faculty'
    ? 'from-purple-600 to-purple-500'
    : role === 'senior'
    ? 'from-green-600 to-emerald-500'
    : 'from-blue-600 to-blue-500';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-background to-accent/10">

      {/* ── Left panel (branding) — hidden on small screens ── */}
      <div className={`hidden lg:flex lg:w-2/5 flex-col items-center justify-center bg-gradient-to-br ${roleAccent} p-12 text-white`}>
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 shadow-2xl backdrop-blur-sm">
          <GraduationCap className="h-12 w-12" />
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight">CampusSphere</h1>
        <p className="mb-10 text-center text-lg text-white/80">
          Your all-in-one academic ecosystem
        </p>
        <div className="w-full space-y-4">
          {[
            'Share notes & study resources',
            'Connect with seniors & mentors',
            'Join hackathons & events',
            'Track your career roadmap',
            'Prepare for placements',
          ].map(f => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-white/80" />
              <span className="text-white/90">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ──────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10 lg:px-10">

        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">CampusSphere</h1>
          <p className="text-sm text-muted-foreground">Your all-in-one academic ecosystem</p>
        </div>

        <div className="w-full max-w-lg">

          {/* ── Tab switcher ───────────────────────────────── */}
          <div className="mb-6 flex rounded-xl bg-muted p-1 shadow-inner">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* LOGIN FORM                                       */}
          {/* ════════════════════════════════════════════════ */}
          {mode === 'login' && (
            <div className="rounded-2xl border bg-card p-6 shadow-xl">
              <h2 className="mb-1 text-xl font-bold">Welcome back</h2>
              <p className="mb-6 text-sm text-muted-foreground">Sign in to continue to your dashboard</p>

              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <Field label="Email Address" icon={Mail}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@college.edu"
                      value={loginEmail}
                      onChange={e => { setLoginEmail(e.target.value); setGlobalError(''); }}
                      className="pl-9"
                      autoComplete="email"
                    />
                  </div>
                </Field>

                <Field label="Password" icon={Lock}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => { setLoginPassword(e.target.value); setGlobalError(''); }}
                      className="pl-9 pr-10"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                {globalError && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <span>⚠</span> {globalError}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                    : <><span>Sign In</span><ChevronRight className="ml-1 h-4 w-4" /></>
                  }
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="font-semibold text-primary hover:underline">
                  Register now
                </button>
              </p>

              {/* Demo credentials hint */}
              <details className="mt-4">
                <summary className="cursor-pointer text-center text-xs text-muted-foreground hover:text-foreground">
                  Demo credentials ▾
                </summary>
                <div className="mt-2 space-y-1 rounded-lg bg-muted p-3 text-xs font-mono">
                  <p><span className="font-semibold text-purple-600">Faculty :</span> prof.sharma@campus.edu</p>
                  <p><span className="font-semibold text-green-600">Senior  :</span> arjun.senior@campus.edu</p>
                  <p><span className="font-semibold text-blue-600">Student :</span> amit.student@campus.edu</p>
                  <p className="mt-1 text-muted-foreground">Password: password123</p>
                </div>
              </details>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* SIGNUP FORM                                      */}
          {/* ════════════════════════════════════════════════ */}
          {mode === 'signup' && (
            <div className="rounded-2xl border bg-card p-6 shadow-xl">
              <h2 className="mb-1 text-xl font-bold">Create your account</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Fill in the details below — your record will be saved to MongoDB Atlas
              </p>

              {success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5" noValidate>

                {/* ── Step 1: Choose role ───────────────── */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    I am a…
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setRole(r.value); setFieldErrors({}); setGlobalError(''); }}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                          role === r.value
                            ? r.color + ' border-2'
                            : 'border-border bg-background hover:bg-muted'
                        }`}
                      >
                        <r.icon className="h-6 w-6" />
                        <span className="text-xs font-semibold leading-tight">{r.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-center text-xs text-muted-foreground">
                    {ROLES.find(r => r.value === role)?.desc}
                  </p>
                </div>

                {/* ── Step 2: Personal details ──────────── */}
                <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal Details</p>

                  <Field label="Full Name" icon={User} error={fieldErrors.full_name}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Arjun Sharma" value={form.full_name}
                        onChange={e => set('full_name', e.target.value)} className="pl-9"
                        autoComplete="name" />
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Email" icon={Mail} error={fieldErrors.email}>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="you@college.edu" value={form.email}
                          onChange={e => set('email', e.target.value)} className="pl-9"
                          autoComplete="email" />
                      </div>
                    </Field>

                    <Field label="Phone" icon={Phone}>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="tel" placeholder="+91 98765 43210" value={form.phone}
                          onChange={e => set('phone', e.target.value)} className="pl-9" />
                      </div>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Password" icon={Lock} error={fieldErrors.password}>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type={showPass ? 'text' : 'password'} placeholder="Min 6 chars"
                          value={form.password} onChange={e => set('password', e.target.value)}
                          className="pl-9 pr-9" autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPass(s => !s)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </Field>

                    <Field label="Confirm Password" icon={Lock} error={fieldErrors.confirm_password}>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type={showPass ? 'text' : 'password'} placeholder="Repeat password"
                          value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)}
                          className="pl-9" autoComplete="new-password" />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* ── Step 4: Role-specific fields ─────── */}

                {/* FACULTY fields */}
                {role === 'faculty' && (
                  <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50/40 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-purple-700">
                      <Shield className="h-3.5 w-3.5" /> Faculty Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Employee ID" icon={Briefcase} error={fieldErrors.employee_id}>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="EMP-2024-001" value={form.employee_id}
                            onChange={e => set('employee_id', e.target.value)} className="pl-9" />
                        </div>
                      </Field>
                      <Field label="Designation" icon={Briefcase} error={fieldErrors.designation}>
                        <Select value={form.designation} onValueChange={v => set('designation', v)}>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>
                            {DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* Global error */}
                {globalError && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <span>⚠</span> {globalError}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>
                    : <><span>Create Account</span><ChevronRight className="ml-1 h-4 w-4" /></>
                  }
                </Button>

                {/* Schema note */}
                <p className="text-center text-xs text-muted-foreground">
                  Your data is saved to{' '}
                  <span className="font-semibold text-green-600">MongoDB Atlas</span>
                  {' · '}collection: <code className="rounded bg-muted px-1 py-0.5">users</code>
                  {' · '}role: <code className="rounded bg-muted px-1 py-0.5">{role}</code>
                </p>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already registered?{' '}
                <button onClick={() => switchMode('login')} className="font-semibold text-primary hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
