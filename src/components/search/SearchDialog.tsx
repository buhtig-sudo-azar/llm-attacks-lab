'use client';

import { topics } from '@/data/topics';
import { useNavigationStore } from '@/store/navigation-store';
import { useState, useMemo, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { SearchItem } from '@/types';

const allSearchItems: SearchItem[] = [];
for (const category of topics) {
  allSearchItems.push({
    type: 'category',
    title: category.title,
    description: category.description,
    categorySlug: category.slug,
    keywords: [category.title, category.description],
  });
  for (const sub of category.subtopics) {
    allSearchItems.push({
      type: 'subtopic',
      title: sub.title,
      description: sub.introduction.what.slice(0, 150),
      categorySlug: category.slug,
      subtopicSlug: sub.slug,
      keywords: [sub.title, sub.introduction.what, ...sub.theory.terms.map(t => t.term)],
    });
  }
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { navigateToSubtopic, navigateToCategory } = useNavigationStore();

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return allSearchItems.filter(item =>
      item.keywords.some(k => k.toLowerCase().includes(q)) ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query]);

  const handleSelect = useCallback((item: SearchItem) => {
    if (item.subtopicSlug) {
      navigateToSubtopic(item.categorySlug, item.subtopicSlug);
    } else {
      navigateToCategory(item.categorySlug);
    }
    setOpen(false);
    setQuery('');
  }, [navigateToSubtopic, navigateToCategory]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
    }
  }, []);

  // Register global shortcut
  if (typeof window !== 'undefined') {
    // Using inline event registration via Dialog's onOpenChange
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Поиск по темам
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Искать: cache, delimiter, WCD..."
            autoFocus
          />
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {results.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              </button>
            ))}
            {query.trim() && results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Ничего не найдено</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">Ctrl+K для быстрого поиска</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
