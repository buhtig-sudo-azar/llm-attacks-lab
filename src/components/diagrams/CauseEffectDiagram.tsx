'use client';

import { CauseEffectData } from '@/types';
import { GraphDiagram, GraphNode, GraphLink, GraphLegend } from './GraphDiagram';

const ROLE_STYLES: Record<string, { color: string; symbol: string; roleLabel: string }> = {
  cause:  { color: '#3b82f6', symbol: '\u25CE', roleLabel: 'Причина' },    // ◎
  effect: { color: '#f59e0b', symbol: '\u25C9', roleLabel: 'Следствие' },  // ◉
  danger: { color: '#ef4444', symbol: '\u26A0', roleLabel: 'Угроза' },     // ⚠
};

export function CauseEffectDiagram({ data }: { data: CauseEffectData }) {
  const steps = data.steps;
  const PAD = 60;
  const NODE_GAP = 80;
  const svgW = 500;
  const svgH = PAD + steps.length * NODE_GAP + PAD;
  const cx = svgW / 2;

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const legend: GraphLegend[] = [];

  steps.forEach((step, i) => {
    const style = ROLE_STYLES[step.role] ?? ROLE_STYLES.cause;
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
        ? `${style.roleLabel}: ${step.label} — ${step.detail}`
        : `${style.roleLabel}: ${step.label}. Элемент цепочки «причина → следствие → угроза».`,
      radius: step.role === 'danger' ? 30 : 26,
    });

    if (i > 0) {
      const prevStyle = ROLE_STYLES[steps[i - 1].role] ?? ROLE_STYLES.cause;
      links.push({
        from: `step-${i - 1}`,
        to: `step-${i}`,
        color: step.role === 'danger' ? '#ef4444' : prevStyle.color,
        animated: step.role === 'danger',
      });
    }
  });

  // Legend
  const seenRoles = new Set<string>();
  steps.forEach(step => {
    if (!seenRoles.has(step.role)) {
      seenRoles.add(step.role);
      const style = ROLE_STYLES[step.role] ?? ROLE_STYLES.cause;
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
