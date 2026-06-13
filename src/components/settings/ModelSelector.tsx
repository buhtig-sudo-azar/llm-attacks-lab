'use client';

import { useState, useEffect } from 'react';
import { useModelStore } from '@/store/model-store';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Cpu, ChevronsUpDown, Check, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ModelAvailabilityPanel } from './ModelAvailabilityPanel';

const DEFAULT_MODELS = [
  { id: 'moonshotai/kimi-k2.6:free', name: 'Kimi K2.6', label: 'Kimi K2.6 (Free)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', label: 'DeepSeek R1 (Free)' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', label: 'Gemma 3 27B (Free)' },
  { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick', label: 'Llama 4 Maverick (Free)' },
];

export function ModelSelector() {
  const { currentModel, setCurrentModel, _hydrate, rateLimits } = useModelStore();
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    _hydrate();
  }, [_hydrate]);

  const currentLabel = DEFAULT_MODELS.find(m => m.id === currentModel)?.label || currentModel.split('/').pop() || currentModel;

  const currentRateLimit = rateLimits[currentModel];
  const isCurrentRateLimited = currentRateLimit?.reason === 'rate_limited';
  const isCurrentUnavailable = currentRateLimit?.available === false && currentRateLimit?.reason !== 'rate_limited';

  const applyModel = (model: string) => {
    setCurrentModel(model);
    setOpen(false);
    toast({
      title: 'Модель применена',
      description: `Активна: ${model.split('/').pop()}`,
    });
  };

  const handleCustomSubmit = () => {
    const model = customInput.trim();
    if (!model) return;
    applyModel(model);
    setCustomInput('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-1.5 h-8 px-2.5 text-xs font-medium transition-all',
            isCurrentRateLimited
              ? 'border-amber-500/40 hover:border-amber-500/60 bg-amber-500/5'
              : isCurrentUnavailable
                ? 'border-red-500/40 hover:border-red-500/60 bg-red-500/5'
                : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
          )}
        >
          {isCurrentRateLimited ? (
            <AlertTriangle className="h-3 w-3 text-amber-500" />
          ) : isCurrentUnavailable ? (
            <WifiOff className="h-3 w-3 text-red-500" />
          ) : (
            <Cpu className="h-3 w-3 text-primary" />
          )}
          <span className="max-w-[100px] sm:max-w-[160px] truncate">
            {currentLabel}
          </span>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-0" align="end">
        <Command>
          <div className="flex items-center border-b border-border px-3">
            <CommandInput placeholder="Поиск моделей..." className="flex-1" />
          </div>
          <CommandList>
            <CommandEmpty>Модель не найдена</CommandEmpty>
            <CommandGroup heading="Бесплатные модели">
              {DEFAULT_MODELS.map((model) => {
                const info = rateLimits[model.id];
                const isRateLimited = info?.reason === 'rate_limited';
                const isUnavailable = info?.available === false;
                return (
                  <CommandItem
                    key={model.id}
                    value={model.label + ' ' + model.id}
                    onSelect={() => applyModel(model.id)}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer',
                      isRateLimited && 'opacity-60',
                      isUnavailable && 'opacity-40'
                    )}
                  >
                    <Check
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        currentModel === model.id ? 'opacity-100 text-primary' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-1.5">
                        {model.label}
                        {isRateLimited && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 font-normal">лимит</span>
                        )}
                        {isUnavailable && info?.reason === 'not_found' && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-red-500/10 text-red-600 font-normal">недоступна</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        {model.id}
                      </div>
                    </div>
                    {info?.available && info.remaining !== null && info.remaining !== undefined && (
                      <span className={cn(
                        'text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0',
                        info.remaining < 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'
                      )}>
                        {info.remaining}/{info.limit || '?'}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        <div className="p-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-2">Пользовательский ID модели:</p>
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="vendor/model:free"
              className="flex-1 h-8 px-2 text-xs font-mono rounded-md border border-input bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomSubmit();
                }
              }}
            />
            <Button
              size="sm"
              className="h-8 px-3 text-xs shrink-0"
              onClick={handleCustomSubmit}
              disabled={!customInput.trim()}
            >
              Применить
            </Button>
          </div>
        </div>

        <div className="px-3 py-2 border-t border-border">
          <ApiTokenInput />
        </div>

        <ModelAvailabilityPanel />
      </PopoverContent>
    </Popover>
  );
}

function ApiTokenInput() {
  const { apiToken, setApiToken, clearApiToken, checkModel } = useModelStore();
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | null>(null);
  const { toast } = useToast();

  const handleSave = async () => {
    const token = inputValue.trim();
    if (!token) return;
    setApiToken(token);
    setInputValue('');
    setIsExpanded(false);
    toast({
      title: 'Токен сохранён',
      description: 'Ваш API-токен будет использоваться для всех запросов к моделям.',
    });
  };

  const handleVerify = async () => {
    if (!apiToken) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const result = await checkModel('moonshotai/kimi-k2.6:free');
      setVerifyResult(result.available ? 'valid' : 'invalid');
      if (result.available) {
        toast({
          title: 'Токен валиден',
          description: 'API-ключ работает корректно.',
        });
      } else {
        toast({
          title: 'Токен невалиден',
          description: 'API-ключ не прошёл проверку. Проверьте правильность ключа.',
          variant: 'destructive',
        });
      }
    } catch {
      setVerifyResult('invalid');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemove = () => {
    clearApiToken();
    setVerifyResult(null);
    toast({
      title: 'Токен удалён',
      description: 'Теперь используется общий токен платформы.',
    });
  };

  const hasToken = apiToken.length > 0;
  const maskedToken = hasToken ? apiToken.slice(0, 6) + '...' + apiToken.slice(-4) : '';

  if (!isExpanded && !hasToken) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>+ Добавить OpenRouter токен</span>
        </button>
        <p className="text-[10px] text-muted-foreground text-center">
          Бесплатный ключ:{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            openrouter.ai/keys
          </a>
        </p>
      </div>
    );
  }

  if (!isExpanded && hasToken) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 h-7 px-2 rounded-md border border-border bg-muted/30 text-xs">
          <span className="font-mono text-muted-foreground truncate flex-1">
            {maskedToken}
          </span>
          {verifyResult === 'valid' && (
            <Wifi className="w-3 h-3 text-green-500 shrink-0" />
          )}
          {verifyResult === 'invalid' && (
            <WifiOff className="w-3 h-3 text-red-500 shrink-0" />
          )}
        </div>
        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="text-[10px] text-primary hover:underline shrink-0 disabled:opacity-50"
        >
          {isVerifying ? '...' : 'Проверить'}
        </button>
        <button
          onClick={handleRemove}
          className="text-[10px] text-destructive hover:underline shrink-0"
        >
          Удалить
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="sk-or-v1-..."
        type="password"
        className="flex-1 h-7 px-2 text-xs font-mono rounded-md border border-input bg-background"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
          }
          if (e.key === 'Escape') {
            setIsExpanded(false);
            setInputValue('');
          }
        }}
      />
      <Button
        size="sm"
        className="h-7 px-2 text-xs shrink-0"
        onClick={handleSave}
        disabled={!inputValue.trim()}
      >
        Сохранить
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs shrink-0"
        onClick={() => {
          setIsExpanded(false);
          setInputValue('');
        }}
      >
        Отмена
      </Button>
    </div>
  );
}
