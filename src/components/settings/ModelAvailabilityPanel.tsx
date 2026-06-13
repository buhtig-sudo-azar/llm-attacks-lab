'use client';

import { useModelStore, FreeModel, ModelRateLimit } from '@/store/model-store';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw, Wifi, WifiOff, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const DEFAULT_MODELS = [
  { id: 'moonshotai/kimi-k2.6:free', name: 'Kimi K2.6', label: 'Kimi K2.6 (Free)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', label: 'DeepSeek R1 (Free)' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', label: 'Gemma 3 27B (Free)' },
  { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick', label: 'Llama 4 Maverick (Free)' },
];

function StatusIcon({ info }: { info: ModelRateLimit | undefined }) {
  if (!info) {
    return <span className="w-4 h-4 rounded-full bg-muted-foreground/20 inline-block shrink-0" />;
  }

  if (info.available) {
    return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
  }

  if (info.reason === 'rate_limited') {
    return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
  }

  return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
}

function RateLimitBadge({ info }: { info: ModelRateLimit | undefined }) {
  if (!info) return null;

  if (info.available && info.remaining !== null && info.remaining !== undefined) {
    const isLow = info.remaining < 5;
    return (
      <span className={cn(
        'text-[10px] font-mono px-1.5 py-0.5 rounded',
        isLow ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'
      )}>
        {info.remaining}/{info.limit || '?'} ост.
      </span>
    );
  }

  if (info.reason === 'rate_limited') {
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
        лимит исчерпан
      </span>
    );
  }

  if (info.reason === 'not_found') {
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-600">
        не найдена
      </span>
    );
  }

  if (info.reason === 'error') {
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-600">
        ошибка
      </span>
    );
  }

  return null;
}

function LatencyBadge({ info }: { info: ModelRateLimit | undefined }) {
  if (!info?.latency) return null;
  const ms = info.latency;
  const isFast = ms < 2000;
  const isMedium = ms < 5000;
  return (
    <span className={cn(
      'text-[10px] font-mono px-1.5 py-0.5 rounded',
      isFast ? 'bg-green-500/10 text-green-600' : isMedium ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
    )}>
      {ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`}
    </span>
  );
}

export function ModelAvailabilityPanel() {
  const {
    availableModels,
    isLoadingModels,
    isCheckingAll,
    rateLimits,
    fetchAvailableModels,
    checkAllModels,
    checkModel,
    currentModel,
    _hydrate,
  } = useModelStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [checkingModel, setCheckingModel] = useState<string | null>(null);

  useEffect(() => {
    _hydrate();
  }, [_hydrate]);

  useEffect(() => {
    fetchAvailableModels();
  }, [fetchAvailableModels]);

  const displayModels = availableModels.length > 0 ? availableModels : DEFAULT_MODELS;

  const handleCheckAll = async () => {
    await checkAllModels();
  };

  const handleCheckOne = async (modelId: string) => {
    setCheckingModel(modelId);
    try {
      await checkModel(modelId);
    } finally {
      setCheckingModel(null);
    }
  };

  const availableCount = displayModels.filter(m => rateLimits[m.id]?.available).length;
  const rateLimitedCount = displayModels.filter(m => rateLimits[m.id]?.reason === 'rate_limited').length;
  const totalChecked = Object.keys(rateLimits).length;

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {availableCount > 0 ? (
            <Wifi className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span className="font-medium">Доступность моделей</span>
          {totalChecked > 0 && (
            <span className="text-[10px] text-muted-foreground">
              ({availableCount}/{displayModels.length} доступно{rateLimitedCount > 0 ? `, ${rateLimitedCount} лимит` : ''})
            </span>
          )}
        </div>
        <span className={cn(
          'text-[10px] transition-transform',
          isExpanded ? 'rotate-180' : ''
        )}>
          ▾
        </span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1.5 flex-1"
              onClick={handleCheckAll}
              disabled={isCheckingAll}
            >
              {isCheckingAll ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Проверяю...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Проверить все
                </>
              )}
            </Button>
          </div>

          <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
            {displayModels.map((model) => {
              const info = rateLimits[model.id];
              const isCurrentModel = model.id === currentModel;
              const isChecking = checkingModel === model.id;

              return (
                <div
                  key={model.id}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                    isCurrentModel ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50',
                    info?.available === false && 'opacity-70'
                  )}
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {isChecking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                    ) : (
                      <StatusIcon info={info} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'truncate text-[11px]',
                        isCurrentModel ? 'font-semibold text-primary' : 'font-medium'
                      )}>
                        {model.label || model.name}
                        {isCurrentModel && (
                          <span className="ml-1.5 text-[9px] font-normal text-primary/70">(активна)</span>
                        )}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-mono truncate">
                        {model.id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <LatencyBadge info={info} />
                    <RateLimitBadge info={info} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckOne(model.id);
                      }}
                      disabled={isChecking || isCheckingAll}
                      className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
                      title="Проверить доступность"
                    >
                      <Zap className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {isLoadingModels && (
            <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Загрузка списка моделей...
            </div>
          )}

          {totalChecked > 0 && (
            <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Последняя проверка: {new Date(Math.max(...Object.values(rateLimits).map(r => r.checkedAt || 0))).toLocaleTimeString('ru-RU')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
