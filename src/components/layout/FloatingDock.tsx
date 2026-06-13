'use client';

import { useNavigationStore } from '@/store/navigation-store';
import { ArrowUp, BotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingDock() {
  const { setChatOpen, setSidebarOpen } = useNavigationStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg"
        onClick={scrollToTop}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        onClick={() => setChatOpen(true)}
      >
        <BotIcon className="h-5 w-5" />
      </Button>
    </div>
  );
}
