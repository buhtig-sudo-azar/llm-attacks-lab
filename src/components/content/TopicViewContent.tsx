'use client';

import { Subtopic } from '@/types';
import {
  Lightbulb, BookOpen, GitBranch, Code2, AlertTriangle,
  FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { WcdSandbox } from '@/components/sandbox/WcdSandbox';
import { LlmSandbox } from '@/components/sandbox/LlmSandbox';
import { DiagramRenderer } from '@/components/diagrams/DiagramRenderer';

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <Icon className="h-6 w-6 text-primary" />
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

export function TopicViewContent({ subtopic }: { subtopic: Subtopic }) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <SectionTitle icon={Lightbulb} title="Введение" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg text-primary mb-1.5">Что это такое?</h4>
            <p className="text-lg text-muted-foreground leading-relaxed">{subtopic.introduction.what}</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-primary mb-1.5">Зачем это нужно?</h4>
            <p className="text-lg text-muted-foreground leading-relaxed">{subtopic.introduction.why}</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-primary mb-1.5">Где используется?</h4>
            <p className="text-lg text-muted-foreground leading-relaxed">{subtopic.introduction.where}</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-primary mb-1.5">Какую проблему решает?</h4>
            <p className="text-lg text-muted-foreground leading-relaxed">{subtopic.introduction.problem}</p>
          </div>
        </CardContent>
      </Card>

      {/* Theory */}
      <Card>
        <CardHeader>
          <SectionTitle icon={BookOpen} title="Теоретическая часть" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-xl mb-3">Основные термины</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subtopic.theory.terms.map((term) => (
                <div key={term.term} className="p-4 rounded-lg border border-border bg-muted/30">
                  <dt className="font-semibold text-base text-primary">{term.term}</dt>
                  <dd className="text-base text-muted-foreground mt-1 leading-relaxed">{term.definition}</dd>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-xl mb-3">Принципы работы</h4>
            <MarkdownRenderer content={subtopic.theory.principles} />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-xl mb-3">Архитектура</h4>
            <MarkdownRenderer content={subtopic.theory.architecture} />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-xl mb-3">Связи с другими технологиями</h4>
            <MarkdownRenderer content={subtopic.theory.connections} />
          </div>
        </CardContent>
      </Card>

      {/* Diagram */}
      <Card>
        <CardHeader>
          <SectionTitle icon={GitBranch} title="Визуальная схема" />
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold text-xl mb-3">{subtopic.diagram.title}</h4>
          <DiagramRenderer data={subtopic.diagram} />
        </CardContent>
      </Card>

      {/* Practical Examples */}
      <Card>
        <CardHeader>
          <SectionTitle icon={Code2} title="Практические примеры" />
        </CardHeader>
        <CardContent className="space-y-4">
          {subtopic.practicalExamples.map((example, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted/30">
                <h4 className="font-semibold text-lg">{example.title}</h4>
                <p className="text-base text-muted-foreground mt-1">{example.description}</p>
              </div>
              {example.code && (
                <div className="relative">
                  <SyntaxHighlighter
                    language={example.language || 'typescript'}
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      fontSize: '15px',
                      borderRadius: 0,
                    }}
                  >
                    {example.code}
                  </SyntaxHighlighter>
                  {example.language && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-xs"
                    >
                      {example.language}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interactive Sandboxes */}
      {subtopic.sandboxes && subtopic.sandboxes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Интерактивные песочницы</h2>
          </div>
          {subtopic.sandboxes.map((sandbox, i) => {
            const isLlmSandbox = !['cache-flow-sim','cache-key-lab','delimiter-lab','path-mapping-lab','normalization-lab','static-rule-lab','attack-builder','cache-defense-lab','header-inspector','url-parser','encoding-lab','request-flow-lab'].includes(sandbox.type);
            return isLlmSandbox
              ? <LlmSandbox key={i} type={sandbox.type as any} title={sandbox.title} description={sandbox.description} defaultPrompt={sandbox.defaultPrompt} defaultSystem={sandbox.defaultSystem} />
              : <WcdSandbox key={i} type={sandbox.type} title={sandbox.title} description={sandbox.description} />;
          })}
        </div>
      )}

      {/* Common Mistakes */}
      <Card>
        <CardHeader>
          <SectionTitle icon={AlertTriangle} title="Частые ошибки новичков" />
        </CardHeader>
        <CardContent className="space-y-4">
          {subtopic.commonMistakes.map((mistake, i) => (
            <div key={i} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <h4 className="font-semibold text-lg text-destructive mb-2">❌ {mistake.mistake}</h4>
              <p className="text-lg text-muted-foreground mb-2">{mistake.explanation}</p>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-lg"><span className="font-semibold text-primary">✅ Правильный подход:</span> {mistake.correctApproach}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


    </div>
  );
}
