import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DailyCheckIn, Task, SubTask, JournalEntry, FocusSession, Profile, EnergyLevel, FocusLevel, MoodLevel } from '../types';

interface FocuslyState {
  profile: Profile | null;
  checkIns: DailyCheckIn[];
  tasks: Task[];
  journalEntries: JournalEntry[];
  focusSessions: FocusSession[];
  completedRoutineSteps: Record<string, string[]>; // dateKey -> stepTitles

  // Actions
  setProfile: (profile: Profile | null) => void;
  upgradeSubscription: (tier: 'monthly' | 'yearly' | 'lifetime') => void;
  cancelSubscription: () => void;
  
  addCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'timestamp'>) => void;
  addTask: (title: string, energy: EnergyLevel, isAnchor?: boolean) => boolean; // returns false if freemium limit reached
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  postponeTask: (taskId: string) => void;
  breakDownTask: (taskId: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  
  toggleRoutineStep: (dateKey: string, routineId: string, stepTitle: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => boolean; // returns false if freemium limit reached
  addFocusSession: (taskTitle: string, durationSeconds: number) => boolean; // returns false if limit reached
}

export const useFocuslyStore = create<FocuslyState>()(
  persist(
    (set, get) => ({
      profile: {
        id: 'user_dev_id',
        email: 'utilizator@demo.ro',
        subscription_status: 'free',
        created_at: new Date().toISOString()
      },
      checkIns: [],
      tasks: [
        {
          id: '1',
          title: 'Bea un pahar cu apă de 250ml 💧',
          energyRequired: 'low',
          isCompleted: false,
          isUrgent: false,
          isImportant: false,
          isAnchorTask: true,
          subtasks: [],
          createdAt: Date.now()
        },
        {
          id: '2',
          title: 'Fă ordine pe birou (doar 3 obiecte) 🧘',
          energyRequired: 'medium',
          isCompleted: false,
          isUrgent: false,
          isImportant: false,
          isAnchorTask: true,
          subtasks: [],
          createdAt: Date.now()
        }
      ],
      journalEntries: [],
      focusSessions: [],
      completedRoutineSteps: {},

      setProfile: (profile) => set({ profile }),

      upgradeSubscription: (tier) => {
        const currentProfile = get().profile;
        if (!currentProfile) return;
        set({
          profile: {
            ...currentProfile,
            subscription_status: 'premium',
            subscription_period: tier
          }
        });
      },

      cancelSubscription: () => {
        const currentProfile = get().profile;
        if (!currentProfile) return;
        set({
          profile: {
            ...currentProfile,
            subscription_status: 'free',
            subscription_period: undefined
          }
        });
      },

      addCheckIn: (checkIn) => {
        const newCheckIn: DailyCheckIn = {
          ...checkIn,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now()
        };
        set((state) => ({
          checkIns: [newCheckIn, ...state.checkIns.filter(c => c.date !== checkIn.date)]
        }));
      },

      addTask: (title, energy, isAnchor = false) => {
        const isPremium = get().profile?.subscription_status === 'premium';
        const activeTasksCount = get().tasks.filter(t => !t.isCompleted).length;

        // Freemium limit: max 5 active tasks
        if (!isPremium && activeTasksCount >= 5) {
          return false;
        }

        const newTask: Task = {
          id: Math.random().toString(36).substring(7),
          title,
          energyRequired: energy,
          isCompleted: false,
          isUrgent: false,
          isImportant: false,
          isAnchorTask: isAnchor,
          subtasks: [],
          createdAt: Date.now()
        };

        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return true;
      },

      toggleTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? Date.now() : undefined }
              : t
          )
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId)
        }));
      },

      postponeTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, isAnchorTask: false, createdAt: Date.now() }
              : t
          )
        }));
      },

      breakDownTask: (taskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        const subtasks: SubTask[] = [
          { id: 'sub-1', title: 'Deschide documentul sau fișierele (30 sec)', isCompleted: false },
          { id: 'sub-2', title: 'Fă doar o acțiune minusculă (1 min)', isCompleted: false },
          { id: 'sub-3', title: 'Continuă încă 30 de secunde (30 sec)', isCompleted: false }
        ];

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks } : t
          )
        }));
      },

      toggleSubTask: (taskId, subTaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === taskId) {
              const updatedSubtasks = t.subtasks.map((st) =>
                st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
              );
              const allDone = updatedSubtasks.every(st => st.isCompleted);
              return {
                ...t,
                subtasks: updatedSubtasks,
                isCompleted: allDone ? true : t.isCompleted,
                completedAt: allDone ? Date.now() : t.completedAt
              };
            }
            return t;
          })
        }));
      },

      toggleRoutineStep: (dateKey, routineId, stepTitle) => {
        const key = `${dateKey}_${routineId}`;
        set((state) => {
          const current = state.completedRoutineSteps[key] || [];
          const updated = current.includes(stepTitle)
            ? current.filter((s) => s !== stepTitle)
            : [...current, stepTitle];
          return {
            completedRoutineSteps: {
              ...state.completedRoutineSteps,
              [key]: updated
            }
          };
        });
      },

      addJournalEntry: (entry) => {
        const isPremium = get().profile?.subscription_status === 'premium';
        
        // Freemium limit: max 3 journal entries
        if (!isPremium && get().journalEntries.length >= 3) {
          return false;
        }

        const newEntry: JournalEntry = {
          ...entry,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now()
        };

        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries]
        }));
        return true;
      },

      addFocusSession: (taskTitle, durationSeconds) => {
        const isPremium = get().profile?.subscription_status === 'premium';
        const todayKey = new Date().toISOString().split('T')[0];
        
        // Freemium limit: max 3 focus sessions per day
        const sessionsTodayCount = get().focusSessions.filter(s => s.date === todayKey).length;
        if (!isPremium && sessionsTodayCount >= 3) {
          return false;
        }

        const newSession: FocusSession = {
          id: Math.random().toString(36).substring(7),
          taskTitle,
          durationSeconds,
          date: todayKey,
          createdAt: Date.now()
        };

        set((state) => ({
          focusSessions: [newSession, ...state.focusSessions]
        }));
        return true;
      }
    }),
    {
      name: 'focusly-pwa-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
