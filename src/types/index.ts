export type EnergyLevel = 'low' | 'medium' | 'high';
export type FocusLevel = 'scattered' | 'ok' | 'in_flow';
export type MoodLevel = 'overwhelmed' | 'neutral' | 'good';

export interface Profile {
  id: string;
  email: string;
  subscription_status: 'free' | 'premium';
  subscription_period?: 'monthly' | 'yearly' | 'lifetime';
  created_at: string;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  energyRequired: EnergyLevel;
  isCompleted: boolean;
  isUrgent: boolean;
  isImportant: boolean;
  isAnchorTask: boolean;
  subtasks: SubTask[];
  category?: 'work' | 'personal' | 'routine';
  createdAt: number;
  completedAt?: number;
}

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  energy: EnergyLevel;
  focus: FocusLevel;
  mood: MoodLevel;
  timestamp: number;
}

export interface FocusSession {
  id: string;
  taskTitle: string;
  durationSeconds: number;
  date: string;
  createdAt: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  wentWell: string;
  blockers: string[];
  energy?: EnergyLevel;
  mood?: MoodLevel;
  focus?: FocusLevel;
  timestamp: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  readTimeMinutes: number;
  content: string[];
  category: 'ADHD' | 'focus' | 'overwhelm' | 'routine';
}
