export type UserRole = 'student' | 'senior' | 'faculty';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string;
  college: string;
  department: string;
  branch: string;
  semester: number;
  graduation_year: number | null;
  bio: string;
  skills: string[];
  programming_languages: string[];
  projects: string[];
  certifications: string[];
  achievements: string[];
  github: string;
  linkedin: string;
  portfolio: string;
  xp: number;
  level: number;
  learning_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
  subject: string;
  branch: string;
  semester: number | null;
  department: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string;
  views: number;
  downloads: number;
  likes: number;
  saves: number;
  rating_sum: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'branch' | 'semester'>;
}

export interface NoteComment {
  id: string;
  note_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export interface Resource {
  id: string;
  user_id: string;
  title: string;
  description: string;
  resource_type: string;
  subject: string;
  branch: string;
  semester: number | null;
  department: string;
  file_url: string;
  external_url: string;
  tags: string[];
  views: number;
  downloads: number;
  rating_sum: number;
  rating_count: number;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export interface Doubt {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  subject: string;
  topic: string;
  tags: string[];
  views: number;
  upvotes: number;
  downvotes: number;
  answer_count: number;
  best_answer_id: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>;
}

export interface DoubtAnswer {
  id: string;
  doubt_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  is_best: boolean;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>;
}

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  answers: number[];
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  template: string;
  data: ResumeData;
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  personal?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  objective?: string;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    start: string;
    end: string;
    gpa: string;
  }>;
  skills?: string[];
  projects?: Array<{
    title: string;
    description: string;
    link: string;
    technologies: string;
  }>;
  experience?: Array<{
    company: string;
    role: string;
    start: string;
    end: string;
    description: string;
  }>;
  internships?: Array<{
    company: string;
    role: string;
    start: string;
    end: string;
    description: string;
  }>;
  certifications?: Array<{
    title: string;
    issuer: string;
    date: string;
  }>;
  achievements?: string[];
  positions?: string[];
  social?: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
}

export interface CareerRoadmap {
  id: string;
  career_key: string;
  career_name: string;
  description: string;
  phases: RoadmapPhase[];
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  tasks: RoadmapTask[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  skill: string;
  priority: string;
  duration: string;
  difficulty: string;
}

export interface RoadmapProgress {
  id: string;
  user_id: string;
  career_key: string;
  task_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  updated_at: string;
}

export interface Hackathon {
  id: string;
  user_id: string;
  title: string;
  description: string;
  organizer: string;
  start_date: string;
  end_date: string;
  location: string;
  website_url: string;
  prize: string;
  tags: string[];
  max_team_size: number;
  registration_count: number;
  created_at: string;
}

export interface HackathonRegistration {
  id: string;
  hackathon_id: string;
  user_id: string;
  team_name: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export interface MentorshipRequest {
  id: string;
  junior_id: string;
  senior_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface UserNote {
  id: string;
  user_id: string;
  note_id: string;
  liked: boolean;
  saved: boolean;
  rated: number | null;
  created_at: string;
}
