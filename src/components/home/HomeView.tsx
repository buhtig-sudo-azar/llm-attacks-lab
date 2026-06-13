'use client';

import { topics } from '@/data/topics';
import { useNavigationStore } from '@/store/navigation-store';
import { useProgressStore } from '@/store/progress-store';
import {
  Server, Key, Shield, Swords, Scissors, Route, Shrink, FileText, ShieldCheck,
  ArrowRight, Sparkles, BookOpen, MessageCircle, Cpu, KeyRound, HelpCircle, Trophy, Flame,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { motion } from 'framer-motion';
import Image from 'next/image';

const iconMap: Record<string, React.ElementType> = {
  Server, Key, Shield, Swords, Scissors, Route, Shrink, FileText, ShieldCheck,
};

export function HomeView() {
  const { navigateToCategory } = useNavigationStore();
  const totalSubtopics = topics.reduce((acc, t) => acc + t.subtopics.length, 0);
  const overallProgress = useProgressStore(s => s.getOverallProgress(totalSubtopics));
  const completedCount = useProgressStore(s => s.completedSubtopics.length);
  const xp = useProgressStore(s => s.xp);
  const level = useProgressStore(s => s.level);
  const streak = useProgressStore(s => s.streak);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-12 rounded-2xl overflow-hidden"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-banner.png"
            alt="Cache Deception Lab"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>

        {/* Content overlay */}
        <div className="relative text-center py-12 sm:py-16 md:py-20 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 backdrop-blur-sm text-primary text-base font-semibold mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            Интерактивная обучающая платформа
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-5">
            LLM Attacks{' '}
            <span className="text-primary">Lab</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Атаки на языковые модели — интерактивная лаборатория: от основ LLM до продвинутых техник prompt injection и эксплуатации API по PortSwigger.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Ваш прогресс</h2>
          {overallProgress > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Сбросить прогресс
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Сбросить прогресс?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Все просмотренные и изученные темы будут отмечены как непройденные. XP, уровень и серия будут обнулены.
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{level}</p>
            <p className="text-xs text-muted-foreground">Уровень</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <Sparkles className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{xp}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">Серия</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card text-center">
            <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{completedCount}/{totalSubtopics}</p>
            <p className="text-xs text-muted-foreground">Изучено</p>
          </div>
        </div>
      </motion.div>

      {/* How to use */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mb-10 p-5 sm:p-6 rounded-xl border border-border bg-card"
      >
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Как пользоваться платформой</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">1. Изучайте темы</p>
              <p className="text-sm text-muted-foreground">Выберите раздел и изучайте теорию, визуализации и примеры</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">2. Спрашивайте AI</p>
              <p className="text-sm text-muted-foreground">Кнопка AI внизу справа — наставник знает контекст урока</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">3. Экспериментируйте</p>
              <p className="text-sm text-muted-foreground">Песочницы позволяют менять URL, заголовки и видеть результат</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">4. Добавьте ключ AI</p>
              <p className="text-sm text-muted-foreground">Кнопка модели → &quot;Свой токен&quot; → получите на openrouter.ai/keys</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Topic grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topics.map((category, i) => {
          const Icon = iconMap[category.iconName] || Server;
          const progress = useProgressStore.getState().getCategoryProgress(
            category.subtopics.map(s => s.slug)
          );

          return (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <Card
                className="cursor-pointer group hover:border-primary/50 transition-colors hover:shadow-md h-full"
                onClick={() => navigateToCategory(category.slug)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{category.title}</h3>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-base text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-1 flex-1" />
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.subtopics.length} {category.subtopics.length === 1 ? 'тема' : category.subtopics.length < 5 ? 'темы' : 'тем'}
                    </Badge>
                    {progress === 100 && (
                      <Badge className="text-xs bg-primary/20 text-primary">Пройдено ✓</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
