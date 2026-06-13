'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FlaskConical, Play, RotateCcw } from 'lucide-react';

interface WcdSandboxProps {
  type: string;
  title: string;
  description: string;
}

interface CacheResult {
  action: 'HIT' | 'MISS' | 'PASS';
  key: string;
  cached: boolean;
  extension: string;
  isStatic: boolean;
  serverPath: string;
  explanation: string;
}

const STATIC_EXTENSIONS = ['.css', '.js', '.png', '.jpg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip'];
const STATIC_DIRECTORIES = ['/static/', '/assets/', '/public/', '/images/', '/css/', '/js/'];

function analyzeUrl(url: string): CacheResult {
  let key = url;
  let serverPath = url;
  let extension = '';
  let isStatic = false;
  let cached = false;
  let action: CacheResult['action'] = 'MISS';
  let explanation = '';

  // Check for delimiter (;)
  const semicolonIdx = url.indexOf(';');
  if (semicolonIdx !== -1) {
    const beforeSemi = url.substring(0, semicolonIdx);
    const afterSemi = url.substring(semicolonIdx);
    serverPath = beforeSemi;

    const extMatch = afterSemi.match(/\.\w+$/);
    if (extMatch) {
      extension = extMatch[0];
      isStatic = STATIC_EXTENSIONS.includes(extension);
    }
  }

  // Check for encoded characters
  if (url.includes('%2F') || url.includes('%2E') || url.includes('%252F')) {
    serverPath = decodeURIComponent(url.replace(/%25/g, '%'));
    try {
      serverPath = decodeURIComponent(serverPath);
    } catch {}
    // Normalize path
    serverPath = serverPath.replace(/\/\.\.\//g, '/').replace(/\/\//g, '/');
  }

  // Check extension
  const extMatch = url.match(/\.\w+$/);
  if (extMatch && !extension) {
    extension = extMatch[0];
    isStatic = STATIC_EXTENSIONS.includes(extension);
  }

  // Check static directory
  const isInStaticDir = STATIC_DIRECTORIES.some(dir => url.startsWith(dir) || url.includes(dir));

  if (isStatic || isInStaticDir) {
    cached = true;
    action = 'MISS';
    explanation = isStatic
      ? `Кэш видит расширение ${extension} → считает файл статическим → КЭШИРУЕТ!`
      : `Кэш видит статическую директорию → КЭШИРУЕТ!`;
  } else {
    action = 'PASS';
    explanation = `Кэш не видит статического расширения → ПРОПУСКАЕТ (не кэширует)`;
  }

  return { action, key, cached, extension, isStatic, serverPath, explanation };
}

export function WcdSandbox({ type, title, description }: WcdSandboxProps) {
  const [url, setUrl] = useState('/profile.css');
  const [result, setResult] = useState<CacheResult | null>(null);

  const runAnalysis = () => {
    setResult(analyzeUrl(url));
  };

  const reset = () => {
    setUrl('/profile.css');
    setResult(null);
  };

  const presets: Record<string, string[]> = {
    'cache-flow-sim': ['/logo.png', '/api/users', '/profile.css', '/settings;.js'],
    'cache-key-lab': ['/profile', '/profile?lang=en', '/profile;v=1', '/profile#section'],
    'delimiter-lab': ['/profile;.css', '/profile%3B.css', '/profile?x=1.css', '/profile#.css'],
    'path-mapping-lab': ['/static/../../profile', '/assets/..%2Fprofile', '/css/../api/key'],
    'normalization-lab': ['/static/..%2Fprofile', '/PROFILE.CSS', '/a//b/../../profile.css', '/profile%2Ecss'],
    'static-rule-lab': ['/profile.css', '/profile.php', '/profile.css.php', '/profile.png%00.css'],
    'attack-builder': ['/api/user/settings.css', '/profile;.js', '/static/..%2Fsecret.css'],
    'cache-defense-lab': ['/api/data', '/api/data.css', '/profile;.css'],
    'header-inspector': ['/api/secure', '/static/style.css'],
    'url-parser': ['/path/to/file.css', '/a;b.css', '/x%2Fy.css'],
    'encoding-lab': ['/profile%2Ecss', '/profile%252Ecss', '/%2E%2E/profile.css'],
    'request-flow-lab': ['/index.html', '/api/me', '/api/me.css'],
  };

  const currentPresets = presets[type] || presets['cache-flow-sim'];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">URL-путь запроса:</label>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/profile.css"
              className="font-mono"
              onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
            />
            <Button onClick={runAnalysis} className="gap-1.5 shrink-0">
              <Play className="h-4 w-4" />
              Анализ
            </Button>
            <Button variant="outline" onClick={reset} className="shrink-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Примеры URL</p>
          <div className="flex flex-wrap gap-1.5">
            {currentPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => { setUrl(preset); setResult(null); }}
                className="text-xs px-2.5 py-1 rounded-md border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors font-mono text-muted-foreground hover:text-foreground"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge variant={result.action === 'HIT' ? 'default' : result.action === 'MISS' ? 'secondary' : 'destructive'}>
                {result.action}
              </Badge>
              <span className="text-sm font-medium">
                {result.action === 'MISS' ? 'Ответ будет кэширован' : result.action === 'HIT' ? 'Взят из кэша' : 'Не кэшируется'}
              </span>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Cache Key:</p>
                <p className="font-mono text-foreground">{result.key}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Расширение:</p>
                <p className="font-mono text-foreground">{result.extension || 'нет'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Статический?</p>
                <p className={result.isStatic ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
                  {result.isStatic ? 'Да — кэш считает статическим!' : 'Нет'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Путь сервера:</p>
                <p className="font-mono text-foreground">{result.serverPath}</p>
              </div>
            </div>

            <Separator />

            <div className="p-3 rounded-md bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-primary">{result.explanation}</p>
            </div>

            {result.cached && result.serverPath !== result.key && (
              <div className="p-3 rounded-md bg-destructive/5 border border-destructive/10">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ DISCREPANCY: Кэш видит &quot;{result.key}&quot;, а сервер обрабатывает &quot;{result.serverPath}&quot; — это уязвимость WCD!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
