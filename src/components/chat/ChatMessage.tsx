'use client';

import { ChatMessage as ChatMessageType } from '@/types';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';
  const isStreaming = !isUser && !message.content;

  return (
    <div className={cn('flex gap-2 animate-message-in', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
        isUser ? 'bg-primary text-primary-foreground' : 'border border-border bg-primary/10'
      )}>
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        )}
      </div>
      <div className={cn(
        'flex-1 min-w-0 rounded-lg px-4 py-2.5',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        {isUser ? (
          <div className="whitespace-pre-wrap break-words leading-relaxed text-base">
            {message.content}
          </div>
        ) : (
          <MarkdownRenderer
            content={message.content}
            streaming={isStreaming}
          />
        )}
      </div>
    </div>
  );
}
