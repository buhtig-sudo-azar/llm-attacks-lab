import { create } from 'zustand';

interface NavigationState {
  currentView: 'home' | 'category' | 'subtopic';
  currentCategory: string | null;
  currentSubtopic: string | null;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  chatOpen: boolean;
  navigateToHome: () => void;
  navigateToCategory: (slug: string) => void;
  navigateToSubtopic: (categorySlug: string, subtopicSlug: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'home',
  currentCategory: null,
  currentSubtopic: null,
  sidebarOpen: true,
  sidebarCollapsed: false,
  chatOpen: false,
  navigateToHome: () => set({ currentView: 'home', currentCategory: null, currentSubtopic: null }),
  navigateToCategory: (slug) => set({ currentView: 'category', currentCategory: slug, currentSubtopic: null }),
  navigateToSubtopic: (categorySlug, subtopicSlug) =>
    set({ currentView: 'subtopic', currentCategory: categorySlug, currentSubtopic: subtopicSlug }),
  toggleSidebar: () => set((s) => {
    // Если сайдбар был открыт — сворачиваем (collapsed)
    // Если был collapsed — открываем полностью
    if (s.sidebarOpen) {
      return { sidebarOpen: false, sidebarCollapsed: true };
    }
    return { sidebarOpen: true, sidebarCollapsed: false };
  }),
  setSidebarOpen: (open) => set({ sidebarOpen: open, sidebarCollapsed: !open }),
  toggleSidebarCollapse: () => set((s) => {
    if (s.sidebarCollapsed) {
      return { sidebarCollapsed: false, sidebarOpen: true };
    }
    return { sidebarCollapsed: true, sidebarOpen: false };
  }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed, sidebarOpen: !collapsed }),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  setChatOpen: (open) => set({ chatOpen: open }),
}));
