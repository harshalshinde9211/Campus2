import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Layout } from '@/components/Layout';
import { AuthPage } from '@/pages/Auth';
import { Dashboard } from '@/pages/Dashboard';
import { Notes } from '@/pages/Notes';
import { Resources } from '@/pages/Resources';
import { Doubts } from '@/pages/Doubts';
import { Quizzes } from '@/pages/Quizzes';
import { ResumeBuilder } from '@/pages/ResumeBuilder';
import { Roadmap } from '@/pages/Roadmap';
import { Placement } from '@/pages/Placement';
import { Hackathons } from '@/pages/Hackathons';
import { Networking } from '@/pages/Networking';
import { Community } from '@/pages/Community';
import { Profile } from '@/pages/Profile';
import { Admin } from '@/pages/Admin';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/doubts" element={<Doubts />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/placement" element={<Placement />} />
        <Route path="/hackathons" element={<Hackathons />} />
        <Route path="/networking" element={<Networking />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
