'use client';

import { ProcessingFlowDiagramData } from '@/types';
import { GraphDiagram, GraphNode, GraphLink, GraphLegend } from './GraphDiagram';

const ROLE_STYLES: Record<string, { color: string; symbol: string; roleLabel: string }> = {
  input:    { color: '#3b82f6', symbol: '\u25B6',  roleLabel: 'Ввод' },          // ▶
  process:  { color: '#64748b', symbol: '\u2699',  roleLabel: 'Обработка' },     // ⚙
  decision: { color: '#a855f7', symbol: '\u25C6',  roleLabel: 'Решение' },       // ◆
  output:   { color: '#64748b', symbol: '\u25C0',  roleLabel: 'Вывод' },         // ◀
  danger:   { color: '#ef4444', symbol: '\u26A0',  roleLabel: 'Опасность' },     // ⚠
  success:  { color: '#22c55e', symbol: '\u2713',  roleLabel: 'Успех' },         // ✓
  warning:  { color: '#f59e0b', symbol: '\u26A1',  roleLabel: 'Предупреждение' },// ⚡
  neutral:  { color: '#94a3b8', symbol: '\u25CF',  roleLabel: 'Шаг' },           // ●
};

export function ProcessingFlowDiagram({ data }: { data: ProcessingFlowDiagramData }) {
  const steps = data.steps;
  const PAD = 60;
  const NODE_GAP = 70;
  const svgW = 500;
  const svgH = PAD + steps.length * NODE_GAP + PAD;
  const cx = svgW / 2;

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const legend: GraphLegend[] = [];

  steps.forEach((step, i) => {
    const style = ROLE_STYLES[step.role] ?? ROLE_STYLES.neutral;
    const y = PAD + 30 + i * NODE_GAP;

    nodes.push({
      id: `step-${i}`,
      label: step.label,
      x: cx,
      y,
      symbol: style.symbol,
      color: style.color,
      role: style.roleLabel,
      description: step.detail
        ? `${step.label} — ${step.detail}`
        : `Шаг ${i + 1}: ${step.label}.`,
      radius: step.role === 'input' || step.role === 'danger' ? 28 : 24,
    });

    if (i > 0) {
      const prevStyle = ROLE_STYLES[steps[i - 1].role] ?? ROLE_STYLES.neutral;
      links.push({
        from: `step-${i - 1}`,
        to: `step-${i}`,
        color: prevStyle.color,
        label: step.branchLabel,
        animated: step.role === 'danger',
      });
    }
  });

  // Build legend from unique roles
  const seenRoles = new Set<string>();
  steps.forEach(step => {
    if (!seenRoles.has(step.role)) {
      seenRoles.add(step.role);
      const style = ROLE_STYLES[step.role] ?? ROLE_STYLES.neutral;
      legend.push({ color: style.color, label: style.roleLabel });
    }
  });

  return (
    <GraphDiagram
      nodes={nodes}
      links={links}
      legend={legend}
      viewBox={{ x: 0, y: 0, w: svgW, h: svgH }}
    />
  );
}
