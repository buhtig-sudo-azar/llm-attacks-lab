'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState, useCallback, type RefObject } from 'react';

interface ScrollToTopButtonProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
}

const SCROLL_THRESHOLD = 300;

export function ScrollToTopButton({ scrollContainerRef }: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setVisible(el.scrollTop > SCROLL_THRESHOLD);
  }, [scrollContainerRef]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef, handleScroll]);

  const scrollToTop = () => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`fixed bottom-24 right-6 z-40 transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="group relative flex items-center justify-center h-12 w-12 rounded-full
          bg-primary text-primary-foreground shadow-lg
          hover:shadow-xl hover:scale-105 active:scale-95
          transition-all duration-200 ease-out
          border-2 border-background"
        title="Наверх"
      >
        <span className="absolute -inset-1 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <ArrowUp className="h-5 w-5 relative" />
      </button>
    </div>
  );
}
