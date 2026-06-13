'use client';

import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground mt-auto">
      <div className="flex items-center justify-center gap-1.5">
        <Shield className="h-3.5 w-3.5 text-primary" />
        <span>LLM Attacks Lab — Интерактивная лаборатория по атакам на языковые модели</span>
      </div>
      <p className="mt-0.5 text-muted-foreground/50">На основе материалов PortSwigger Web Security Academy</p>
      <p className="mt-0.5 text-muted-foreground/40">Создатель AZAR</p>
    </footer>
  );
}
