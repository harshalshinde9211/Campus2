import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/lib/auth';
import { levelFromXp } from '@/lib/constants';
import { NotificationsMenu } from './NotificationsMenu';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 hover:bg-accent lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              Welcome back, <span className="font-medium text-foreground">{profile?.full_name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:flex">
              <span className="text-xs font-semibold text-primary">
                Level {levelFromXp(profile?.xp || 0)}
              </span>
              <span className="text-xs text-muted-foreground">
                {profile?.xp || 0} XP
              </span>
            </div>
            <NotificationsMenu />
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
