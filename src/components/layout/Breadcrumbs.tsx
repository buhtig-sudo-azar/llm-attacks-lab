'use client';

import { useNavigationStore } from '@/store/navigation-store';
import { topics } from '@/data/topics';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const { currentView, currentCategory, currentSubtopic, navigateToHome, navigateToCategory } = useNavigationStore();

  if (currentView === 'home') return null;

  const category = topics.find(t => t.slug === currentCategory);
  const subtopic = category?.subtopics.find(s => s.slug === currentSubtopic);

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground border-b border-border/50 bg-muted/20">
      <button onClick={navigateToHome} className="hover:text-foreground transition-colors flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span>Обзор</span>
      </button>
      {category && (
        <>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => navigateToCategory(category.slug)} className="hover:text-foreground transition-colors">
            {category.title}
          </button>
        </>
      )}
      {subtopic && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{subtopic.title}</span>
        </>
      )}
    </div>
  );
}
