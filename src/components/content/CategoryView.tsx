'use client';

import { topics } from '@/data/topics';
import { useNavigationStore } from '@/store/navigation-store';
import { useProgressStore } from '@/store/progress-store';
import { useChatStore } from '@/store/chat-store';
import {
  Server, Key, Shield, Swords, Scissors, Route, Shrink, FileText, ShieldCheck,
  ChevronRight, CheckCircle2, Circle, BotIcon, ArrowLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  Server, Key, Shield, Swords, Scissors, Route, Shrink, FileText, ShieldCheck,
};

export function CategoryView() {
  const currentCategory = useNavigationStore(s => s.currentCategory);
  const { navigateToSubtopic, setChatOpen, navigateToHome } = useNavigationStore();
  const { setActiveCategory, clearMessages } = useChatStore();
  const { isCompleted, isViewed, getCategoryProgress } = useProgressStore();

  const category = topics.find(t => t.slug === currentCategory);
  if (!category) return null;

  const Icon = iconMap[category.iconName] || Server;
  const progress = getCategoryProgress(category.subtopics.map(s => s.slug));

  const openChat = () => {
    setActiveCategory(category.slug);
    clearMessages();
    setChatOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={navigateToHome}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-5 text-base group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Обзор</span>
        </button>

        <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{category.title}</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={openChat}
                className="gap-1.5 text-base"
              >
                <BotIcon className="h-4 w-4" />
                AI-наставник
              </Button>
            </div>
            <p className="text-xl text-muted-foreground mt-2">{category.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <Progress value={progress} className="h-1.5 flex-1 max-w-xs" />
              <span className="text-base font-medium text-muted-foreground">{progress}% пройдено</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {category.subtopics.map((sub, i) => {
            const completed = isCompleted(sub.slug);
            const viewed = isViewed(sub.slug);

            return (
              <motion.div
                key={sub.slug}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card
                  className="cursor-pointer group hover:border-primary/50 transition-all"
                  onClick={() => navigateToSubtopic(category.slug, sub.slug)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    ) : viewed ? (
                      <Circle className="h-5 w-5 text-primary/50 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{sub.title}</h3>
                      <p className="text-base text-muted-foreground truncate mt-0.5">
                        {sub.introduction.what.slice(0, 100)}...
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
