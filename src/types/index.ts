export interface Profile {
  id: string;
  phone: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: AchievementItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface Resume {
  id: string;
  profile_id: string;
  title: string;
  template: string;
  data: ResumeData;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  missingElements: string[];
  recommendations: string[];
  atsCompatibility: {
    score: number;
    notes: string;
  };
  keywordMatch: {
    found: string[];
    missing: string[];
  };
}

export interface Analysis {
  id: string;
  profile_id: string;
  job_role: string;
  score: number | null;
  result: AnalysisResult;
  file_name: string | null;
  created_at: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  category: string;
}

export type ViewType = 'create' | 'analyze' | 'settings' | 'edit-resume' | 'view-analysis';

export interface HistoryItem {
  id: string;
  type: 'resume' | 'analysis';
  title: string;
  subtitle: string;
  created_at: string;
  data: any;
}
