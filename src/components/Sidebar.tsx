import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, HelpCircle, ClipboardCheck,
  FileUser, Map, Briefcase, Trophy, Users, MessageSquare, User,
  Shield, LogOut, GraduationCap, X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/lib/constants';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FileText, BookOpen, HelpCircle, ClipboardCheck,
  FileUser, Map, Briefcase, Trophy, Users, MessageSquare, User, Shield,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isAdmin = profile?.role === 'faculty';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r bg-card transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <NavLink to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">CampusSphere</span>
          </NavLink>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.icon] || LayoutDashboard;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
            {isAdmin && (
              <>
                <div className="my-2 border-t" />
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = ICONS[item.icon] || Shield;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )
                      }
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </>
            )}
          </div>
        </nav>

        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile?.full_name || 'User'}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
