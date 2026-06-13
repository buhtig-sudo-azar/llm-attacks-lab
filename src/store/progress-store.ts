import { create } from 'zustand';

interface ProgressState {
  viewedSubtopics: string[];
  completedSubtopics: string[];
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  markAsViewed: (slug: string) => void;
  markAsCompleted: (slug: string) => void;
  unmarkCompleted: (slug: string) => void;
  resetProgress: () => void;
  isCompleted: (slug: string) => boolean;
  isViewed: (slug: string) => boolean;
  getOverallProgress: (total: number) => number;
  getCategoryProgress: (slugs: string[]) => number;
  addXp: (amount: number) => void;
  _hydrate: () => void;
}

const STORAGE_KEY = 'llm-attacks-lab-progress';

function loadFromStorage(): Pick<ProgressState, 'viewedSubtopics' | 'completedSubtopics' | 'xp' | 'level' | 'streak' | 'lastActiveDate'> {
  if (typeof window === 'undefined') return { viewedSubtopics: [], completedSubtopics: [], xp: 0, level: 1, streak: 0, lastActiveDate: null };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        viewedSubtopics: parsed.viewedSubtopics || [],
        completedSubtopics: parsed.completedSubtopics || [],
        xp: parsed.xp || 0,
        level: parsed.level || 1,
        streak: parsed.streak || 0,
        lastActiveDate: parsed.lastActiveDate || null,
      };
    }
  } catch {}
  return { viewedSubtopics: [], completedSubtopics: [], xp: 0, level: 1, streak: 0, lastActiveDate: null };
}

function saveToStorage(state: Partial<ProgressState>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      viewedSubtopics: state.viewedSubtopics,
      completedSubtopics: state.completedSubtopics,
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      lastActiveDate: state.lastActiveDate,
    }));
  } catch {}
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  viewedSubtopics: [],
  completedSubtopics: [],
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  markAsViewed: (slug) =>
    set((s) => {
      if (s.viewedSubtopics.includes(slug)) return s;
      const viewed = [...s.viewedSubtopics, slug];
      saveToStorage({ ...s, viewedSubtopics: viewed });
      return { viewedSubtopics: viewed };
    }),
  markAsCompleted: (slug) =>
    set((s) => {
      if (s.completedSubtopics.includes(slug)) return s;
      const completed = [...s.completedSubtopics, slug];
      const viewed = s.viewedSubtopics.includes(slug) ? s.viewedSubtopics : [...s.viewedSubtopics, slug];
      const newXp = s.xp + 50;
      const newLevel = Math.floor(newXp / 200) + 1;
      const today = new Date().toISOString().split('T')[0];
      const streak = s.lastActiveDate === today ? s.streak : (s.lastActiveDate ? s.streak + 1 : 1);
      saveToStorage({ viewedSubtopics: viewed, completedSubtopics: completed, xp: newXp, level: newLevel, streak, lastActiveDate: today });
      return { completedSubtopics: completed, viewedSubtopics: viewed, xp: newXp, level: newLevel, streak, lastActiveDate: today };
    }),
  unmarkCompleted: (slug) =>
    set((s) => {
      const completed = s.completedSubtopics.filter((x) => x !== slug);
      saveToStorage({ ...s, completedSubtopics: completed });
      return { completedSubtopics: completed };
    }),
  resetProgress: () => {
    saveToStorage({ viewedSubtopics: [], completedSubtopics: [], xp: 0, level: 1, streak: 0, lastActiveDate: null });
    set({ viewedSubtopics: [], completedSubtopics: [], xp: 0, level: 1, streak: 0, lastActiveDate: null });
  },
  isCompleted: (slug) => get().completedSubtopics.includes(slug),
  isViewed: (slug) => get().viewedSubtopics.includes(slug),
  getOverallProgress: (total) => {
    if (total === 0) return 0;
    return Math.round((get().completedSubtopics.length / total) * 100);
  },
  getCategoryProgress: (slugs) => {
    if (slugs.length === 0) return 0;
    const completed = slugs.filter((s) => get().completedSubtopics.includes(s)).length;
    return Math.round((completed / slugs.length) * 100);
  },
  addXp: (amount) =>
    set((s) => {
      const newXp = s.xp + amount;
      const newLevel = Math.floor(newXp / 200) + 1;
      saveToStorage({ ...s, xp: newXp, level: newLevel });
      return { xp: newXp, level: newLevel };
    }),
  _hydrate: () => {
    const data = loadFromStorage();
    set(data);
  },
}));
