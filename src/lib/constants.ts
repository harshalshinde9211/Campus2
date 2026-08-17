export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/notes', label: 'Notes', icon: 'FileText' },
  { path: '/resources', label: 'Study Resources', icon: 'BookOpen' },
  { path: '/doubts', label: 'Doubt Discussion', icon: 'HelpCircle' },
  { path: '/quizzes', label: 'Quizzes', icon: 'ClipboardCheck' },
  { path: '/resume', label: 'Resume Builder', icon: 'FileUser' },
  { path: '/roadmap', label: 'Career Roadmap', icon: 'Map' },
  { path: '/placement', label: 'Placement Prep', icon: 'Briefcase' },
  { path: '/hackathons', label: 'Hackathons', icon: 'Trophy' },
  { path: '/networking', label: 'Networking', icon: 'Users' },
  { path: '/community', label: 'Community', icon: 'MessageSquare' },
  { path: '/profile', label: 'Profile', icon: 'User' },
] as const;

export const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Admin Panel', icon: 'Shield' },
] as const;

export const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical',
  'Aerospace',
  'Biotechnology',
  'Other',
];

export const DEPARTMENTS = [
  'Engineering',
  'Science',
  'Arts',
  'Commerce',
  'Management',
  'Law',
  'Medical',
  'Other',
];

export const SUBJECTS = [
  'Data Structures',
  'Algorithms',
  'Operating Systems',
  'Database Management',
  'Computer Networks',
  'Software Engineering',
  'Web Development',
  'Machine Learning',
  'Artificial Intelligence',
  'Cloud Computing',
  'Cybersecurity',
  'Mobile Development',
  'Digital Logic Design',
  'Microprocessors',
  'Signals & Systems',
  'Control Systems',
  'Power Systems',
  'Thermodynamics',
  'Fluid Mechanics',
  'Structural Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Other',
];

export const CAREER_OPTIONS = [
  { key: 'full_stack', name: 'Full Stack Developer' },
  { key: 'frontend', name: 'Frontend Developer' },
  { key: 'backend', name: 'Backend Developer' },
  { key: 'java', name: 'Java Developer' },
  { key: 'python', name: 'Python Developer' },
  { key: 'data_analyst', name: 'Data Analyst' },
  { key: 'data_scientist', name: 'Data Scientist' },
  { key: 'ai_ml', name: 'AI/ML Engineer' },
  { key: 'devops', name: 'DevOps Engineer' },
  { key: 'cloud', name: 'Cloud Engineer' },
  { key: 'cybersecurity', name: 'Cybersecurity Engineer' },
  { key: 'software_engineer', name: 'Software Engineer' },
];

export function xpForLevel(level: number): number {
  return level * 100;
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function profileCompletion(profile: Partial<Record<string, unknown>>): number {
  const fields = [
    'full_name', 'avatar_url', 'college', 'department', 'branch',
    'bio', 'skills', 'programming_languages', 'projects',
    'github', 'linkedin', 'portfolio',
  ];
  let filled = 0;
  for (const f of fields) {
    const val = profile[f];
    if (Array.isArray(val) ? val.length > 0 : val && String(val).trim()) filled++;
  }
  return Math.round((filled / fields.length) * 100);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}
