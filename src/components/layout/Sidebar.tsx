'use client';

import { useNavigationStore } from '@/store/navigation-store';
import { useProgressStore } from '@/store/progress-store';
import { topics } from '@/data/topics';
import {
  Server, Key, Shield, Swords, Scissors, Route, Shrink, FileText, ShieldCheck,
  CheckCircle2, Circle, ChevronDown, RotateCcw, PanelLeftClose, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const iconMap: Record<string, React.ElementType> = {
  Server, Key, Shield, Swords, Scissors, Route, Shrink, FileText, ShieldCheck,
};

export function Sidebar() {
  const {
    currentView, currentCategory, currentSubtopic,
    navigateToHome, navigateToCategory, navigateToSubtopic,
    sidebarOpen, setSidebarOpen, sidebarCollapsed,
  } = useNavigationStore();
  const { getCategoryProgress, isCompleted, isViewed } = useProgressStore();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(topics.map(t => t.slug))
  );

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const totalSubtopics = topics.reduce((acc, t) => acc + t.subtopics.length, 0);
  const overallProgress = useProgressStore(s => s.getOverallProgress(totalSubtopics));

  // Если collapsed — показываем вертикальную полоску иконок
  if (sidebarCollapsed && !sidebarOpen) {
    return (
      <TooltipProvider delayDuration={200}>
        <aside className="hidden md:flex flex-col items-center w-14 border-r border-border bg-sidebar py-3 gap-1 shrink-0">
          {/* Home icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  useNavigationStore.getState().setSidebarCollapsed(false);
                  navigateToHome();
                }}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  currentView === 'home'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Home className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Обзор</TooltipContent>
          </Tooltip>

          <div className="w-6 h-px bg-border my-1" />

          {/* Category icons */}
          {topics.map((category) => {
            const Icon = iconMap[category.iconName] || Server;
            const isActive = currentCategory === category.slug;

            return (
              <Tooltip key={category.slug}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      useNavigationStore.getState().setSidebarCollapsed(false);
                      navigateToCategory(category.slug);
                    }}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{category.title}</TooltipContent>
              </Tooltip>
            );
          })}
        </aside>
      </TooltipProvider>
    );
  }

  // Полный сайдбар
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed md:relative z-40 md:z-auto top-14 md:top-0 left-0 h-[calc(100vh-3.5rem)] md:h-full border-r border-border bg-sidebar transition-transform duration-300 flex flex-col w-72 shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Навигация</span>
          <button
            onClick={() => {
              setSidebarOpen(false);
              useNavigationStore.getState().setSidebarCollapsed(true);
            }}
            className="p-1.5 rounded-md hover:bg-sidebar-accent/50 text-muted-foreground hover:text-sidebar-foreground transition-colors"
            title="Свернуть панель"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-1 pb-8">
            {/* Progress */}
            <div className="mb-4 px-1">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Прогресс</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{overallProgress}%</span>
                  {overallProgress > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-0.5 rounded hover:bg-sidebar-accent/50 text-muted-foreground hover:text-destructive transition-colors">
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Сбросить прогресс?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Все просмотренные и изученные темы будут отмечены как непройденные.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => useProgressStore.getState().resetProgress()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Сбросить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              <Progress value={overallProgress} className="h-1.5" />
            </div>

            {/* Home button */}
            <button
              onClick={() => {
                navigateToHome();
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                currentView === 'home'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Обзор</span>
            </button>

            {/* Category list */}
            {topics.map((category) => {
              const Icon = iconMap[category.iconName] || Server;
              const isExpanded = expandedCategories.has(category.slug);
              const isActive = currentCategory === category.slug;
              const progress = getCategoryProgress(category.subtopics.map(s => s.slug));

              return (
                <div key={category.slug}>
                  <button
                    onClick={() => {
                      toggleCategory(category.slug);
                      navigateToCategory(category.slug);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group cursor-pointer',
                      isActive && currentView === 'category'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1 text-left truncate">{category.title}</span>
                    <span className="text-xs text-muted-foreground mr-0.5">{progress}%</span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="ml-5 mt-0.5 space-y-0.5">
                      {category.subtopics.map((sub) => {
                        const completed = isCompleted(sub.slug);
                        const viewed = isViewed(sub.slug);
                        const isSubActive = currentSubtopic === sub.slug;

                        return (
                          <button
                            key={sub.slug}
                            onClick={() => {
                              navigateToSubtopic(category.slug, sub.slug);
                              if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors cursor-pointer',
                              isSubActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            )}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            ) : viewed ? (
                              <Circle className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                            )}
                            <span className="truncate">{sub.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
