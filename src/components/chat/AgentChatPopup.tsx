'use client';

import { useChatStore } from '@/store/chat-store';
import { useNavigationStore } from '@/store/navigation-store';
import { chatPrompts } from '@/data/chat-prompts';
import { agents } from '@/data/agent-data';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { X, Minimize2, Maximize2, Shrink, Sparkles, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState, useCallback } from 'react';

export function AgentChatPopup() {
  const { messages, isLoading, activeCategory, setActiveCategory, clearMessages, showSuggestions, setShowSuggestions, retryLastMessage } = useChatStore();
  const { chatOpen, setChatOpen, currentCategory } = useNavigationStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const agent = activeCategory ? agents[activeCategory] : (currentCategory ? agents[currentCategory] : null);
  const systemPrompt = activeCategory ? chatPrompts[activeCategory] || '' : '';

  // Когда чат открывается, установить активного агента по текущей категории
  useEffect(() => {
    if (chatOpen && currentCategory && currentCategory !== activeCategory) {
      setActiveCategory(currentCategory);
      clearMessages();
    }
  }, [chatOpen, currentCategory, activeCategory, setActiveCategory, clearMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOpen = useCallback(() => {
    setChatOpen(true);
    setIsMinimized(false);
  }, [setChatOpen]);

  const handleClose = useCallback(() => {
    setChatOpen(false);
    setIsMinimized(false);
    setIsExpanded(false);
    clearMessages();
  }, [setChatOpen, clearMessages]);

  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const handleRestore = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const lastAssistantMessage = messages.length > 0
    ? [...messages].reverse().find(m => m.role === 'assistant')
    : null;
  const lastMessageIsError = lastAssistantMessage
    ? (lastAssistantMessage.content.includes('Не удалось получить ответ') ||
       lastAssistantMessage.content.includes('Ошибка') ||
       lastAssistantMessage.content.includes('Все модели заняты') ||
       lastAssistantMessage.content.includes('ошибка сети'))
    : false;

  const currentAgent = agent || agents['llm-fundamentals'];

  // Чат закрыт — показываем только иконку чата
  if (!chatOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleOpen}
          className="group relative focus:outline-none"
          title="Открыть ИИ-наставника"
        >
          <span className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${currentAgent.gradient} opacity-40 group-hover:opacity-70 transition-opacity`} />
          <span className="relative flex items-center justify-center w-14 h-14 rounded-full border-2 border-background shadow-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <MessageCircle className="h-6 w-6" />
          </span>
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
        </button>
      </div>
    );
  }

  // Чат свёрнут — показываем мини-иконку с количеством сообщений
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={handleRestore} className="group relative focus:outline-none">
          <span className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${currentAgent.gradient} opacity-50 group-hover:opacity-80 transition-opacity`} />
          <span className="relative flex items-center justify-center w-14 h-14 rounded-full border-2 border-background shadow-lg bg-primary text-primary-foreground">
            <MessageCircle className="h-6 w-6" />
          </span>
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-bold">
              {messages.length}
            </span>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
        </button>
      </div>
    );
  }

  // Чат открыт — показываем панель
  return (
    <div
      className={`
        fixed z-50 flex flex-col
        bg-background border border-border shadow-2xl rounded-2xl overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExpanded
          ? 'sm:bottom-6 sm:right-6 sm:top-6 sm:w-[calc(100vw-3rem)] sm:max-h-[calc(100vh-3rem)] max-sm:inset-3 max-sm:max-h-[calc(100vh-1.5rem)]'
          : 'sm:bottom-6 sm:right-6 sm:w-[420px] sm:max-h-[600px] max-sm:inset-x-3 max-sm:bottom-6 max-sm:top-auto max-sm:max-h-[75vh]'
        }
        animate-in slide-in-from-bottom-4 fade-in duration-200
      `}
    >
      <div className={`relative flex items-center gap-3 px-4 py-3 border-b border-border`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${currentAgent.gradient} opacity-[0.08]`} />
        <div className="relative flex items-center gap-3 w-full">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-sm flex-shrink-0 flex items-center justify-center bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">{currentAgent.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{currentAgent.role}</p>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" onClick={handleExpand}>
              {isExpanded ? <Shrink className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" onClick={handleMinimize}>
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" onClick={handleClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md mb-3 flex items-center justify-center bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <p className="text-base font-semibold">{currentAgent.name}</p>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[280px] mb-4">
              {currentAgent.greeting}
            </p>
            <div className="w-full max-w-[280px] space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Попробуйте спросить</p>
              {currentAgent.suggestions?.map((s, i) => (
                <button
                  key={i}
                  onClick={() => useChatStore.getState().sendMessage(s, systemPrompt || chatPrompts[currentAgent.slug] || '')}
                  disabled={isLoading}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-base">Думаю...</span>
              </div>
            )}
            {!isLoading && lastMessageIsError && (
              <div className="flex justify-center pt-1">
                <Button variant="outline" size="sm" onClick={retryLastMessage} className="gap-1.5 text-xs">
                  <RefreshCw className="h-3 w-3" />
                  Попробовать снова
                </Button>
              </div>
            )}
            {!isLoading && showSuggestions && !lastMessageIsError && currentAgent.suggestions && (
              <div className="pt-2 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ещё вопросы</p>
                {currentAgent.suggestions.map((s, i) => (
                  <button
                    key={`follow-${i}`}
                    onClick={() => useChatStore.getState().sendMessage(s, systemPrompt || chatPrompts[currentAgent.slug] || '')}
                    className="w-full text-left text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput systemPrompt={systemPrompt || chatPrompts[currentAgent.slug] || ''} />
    </div>
  );
}
