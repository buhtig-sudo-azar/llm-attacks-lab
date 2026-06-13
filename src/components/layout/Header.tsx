'use client';

import { useNavigationStore } from '@/store/navigation-store';
import { Menu, Shield, Moon, Sun, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelSelector } from '@/components/settings/ModelSelector';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Header() {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar } = useNavigationStore();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <header className="h-14 border-b border-border flex items-center gap-3 px-3 shrink-0 bg-background z-50">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleSidebar}
        title={sidebarOpen ? 'Свернуть панель' : 'Развернуть панель'}
      >
        {sidebarOpen ? <PanelLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Shield className="h-5 w-5 text-primary shrink-0" />
        <span className="font-bold text-base truncate">Cache Deception Lab</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">Web Cache Deception</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <ModelSelector />

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </header>
  );
}
