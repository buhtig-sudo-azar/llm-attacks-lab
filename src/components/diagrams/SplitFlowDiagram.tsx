'use client';

import { SplitFlowDiagramData } from '@/types';
import { GraphDiagram, GraphNode, GraphLink, GraphLegend } from './GraphDiagram';

export function SplitFlowDiagram({ data }: { data: SplitFlowDiagramData }) {
  const PAD = 80;
  const svgW = Math.max(700, 800);
  const svgH = 200 + Math.max(data.leftBranch.steps.length, data.rightBranch.steps.length) * 90 + (data.conclusion ? 180 : 0) + PAD * 2;

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const legend: GraphLegend[] = [];

  const cx = svgW / 2;
  const leftCx = svgW * 0.28;
  const rightCx = svgW * 0.72;

  // Input node
  const inputY = PAD + 40;
  nodes.push({
    id: 'input',
    label: data.input.label,
    x: cx,
    y: inputY,
    symbol: '\u25B6', // ▶
    color: '#6366f1',
    role: 'Ввод',
    description: `Входной элемент: ${data.input.label}.${data.input.url ? ` URL: ${data.input.url}` : ''} Это начальная точка, из которой происходит разделение потока.`,
    radius: 32,
  });

  // Left branch header
  const branchY = inputY + 90;
  nodes.push({
    id: 'left-branch',
    label: data.leftBranch.label,
    x: leftCx,
    y: branchY,
    symbol: '\u25C8', // ◈
    color: '#f59e0b',
    role: 'Ветвь',
    description: `Ветвь: ${data.leftBranch.label}. Левая ветвь разделения потока от «${data.input.label}».`,
    radius: 26,
  });
  links.push({ from: 'input', to: 'left-branch', color: '#f59e0b', label: data.leftBranch.subtitle });

  // Right branch header
  nodes.push({
    id: 'right-branch',
    label: data.rightBranch.label,
    x: rightCx,
    y: branchY,
    symbol: '\u25C8', // ◈
    color: '#10b981',
    role: 'Ветвь',
    description: `Ветвь: ${data.rightBranch.label}. Правая ветвь разделения потока от «${data.input.label}».`,
    radius: 26,
  });
  links.push({ from: 'input', to: 'right-branch', color: '#10b981', label: data.rightBranch.subtitle });

  // Left steps
  data.leftBranch.steps.forEach((step, i) => {
    const sy = branchY + 85 * (i + 1);
    const roleSymbol = getRoleSymbol(step.role);
    nodes.push({
      id: `left-step-${i}`,
      label: step.label,
      x: leftCx,
      y: sy,
      symbol: roleSymbol,
      color: '#f59e0b',
      role: getRoleLabel(step.role),
      description: step.detail
        ? `${step.label} — ${step.detail}`
        : `Шаг «${step.label}» в ветви «${data.leftBranch.label}».`,
      radius: 22,
    });
    links.push({
      from: i === 0 ? 'left-branch' : `left-step-${i - 1}`,
      to: `left-step-${i}`,
      color: '#f59e0b',
    });
  });

  // Right steps
  data.rightBranch.steps.forEach((step, i) => {
    const sy = branchY + 85 * (i + 1);
    const roleSymbol = getRoleSymbol(step.role);
    nodes.push({
      id: `right-step-${i}`,
      label: step.label,
      x: rightCx,
      y: sy,
      symbol: roleSymbol,
      color: '#10b981',
      role: getRoleLabel(step.role),
      description: step.detail
        ? `${step.label} — ${step.detail}`
        : `Шаг «${step.label}» в ветви «${data.rightBranch.label}».`,
      radius: 22,
    });
    links.push({
      from: i === 0 ? 'right-branch' : `right-step-${i - 1}`,
      to: `right-step-${i}`,
      color: '#10b981',
    });
  });

  // Conclusion
  if (data.conclusion) {
    const conclusionY = branchY + Math.max(data.leftBranch.steps.length, data.rightBranch.steps.length) * 85 + 100;

    nodes.push({
      id: 'conclusion-left',
      label: data.conclusion.left,
      x: leftCx,
      y: conclusionY,
      symbol: '\u25C6', // ◆
      color: '#f59e0b',
      role: 'Результат',
      description: `Результат левой ветви: ${data.conclusion.left}.`,
      radius: 22,
    });

    nodes.push({
      id: 'conclusion-right',
      label: data.conclusion.right,
      x: rightCx,
      y: conclusionY,
      symbol: '\u25C6', // ◆
      color: '#10b981',
      role: 'Результат',
      description: `Результат правой ветви: ${data.conclusion.right}.`,
      radius: 22,
    });

    const lastLeft = data.leftBranch.steps.length > 0
      ? `left-step-${data.leftBranch.steps.length - 1}`
      : 'left-branch';
    const lastRight = data.rightBranch.steps.length > 0
      ? `right-step-${data.rightBranch.steps.length - 1}`
      : 'right-branch';

    links.push({ from: lastLeft, to: 'conclusion-left', color: '#f59e0b' });
    links.push({ from: lastRight, to: 'conclusion-right', color: '#10b981' });

    // Highlight
    if (data.conclusion.highlight) {
      nodes.push({
        id: 'highlight',
        label: data.conclusion.highlight,
        x: cx,
        y: conclusionY + 70,
        symbol: '\u26A0', // ⚠
        color: '#ef4444',
        role: 'Угроза',
        description: `Критический вывод: ${data.conclusion.highlight}. Общее следствие обеих ветвей.`,
        radius: 28,
      });
      links.push({ from: 'conclusion-left', to: 'highlight', color: '#ef4444', animated: true });
      links.push({ from: 'conclusion-right', to: 'highlight', color: '#ef4444', animated: true });
    }
  }

  legend.push({ color: '#6366f1', label: 'Ввод' });
  legend.push({ color: '#f59e0b', label: data.leftBranch.label });
  legend.push({ color: '#10b981', label: data.rightBranch.label });
  if (data.conclusion?.highlight) {
    legend.push({ color: '#ef4444', label: 'Угроза' });
  }

  return (
    <GraphDiagram
      nodes={nodes}
      links={links}
      legend={legend}
      viewBox={{ x: 0, y: 0, w: svgW, h: svgH }}
    />
  );
}

/* ─── Helpers ─── */

function getRoleSymbol(role: string): string {
  const map: Record<string, string> = {
    input: '\u25B6',    // ▶
    process: '\u2699',  // ⚙
    decision: '\u25C6', // ◆
    output: '\u25C0',   // ◀
    danger: '\u26A0',   // ⚠
    success: '\u2713',  // ✓
    warning: '\u26A1',  // ⚡
    neutral: '\u25CF',  // ●
  };
  return map[role] ?? '\u25CF';
}

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    input: 'Ввод',
    process: 'Обработка',
    decision: 'Решение',
    output: 'Вывод',
    danger: 'Опасность',
    success: 'Успех',
    warning: 'Предупреждение',
    neutral: 'Шаг',
  };
  return map[role] ?? 'Шаг';
}
