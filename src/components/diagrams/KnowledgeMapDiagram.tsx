'use client';

import { KnowledgeMapData } from '@/types';
import { GraphDiagram, GraphNode, GraphLink, GraphLegend } from './GraphDiagram';

const TOPIC_COLORS = [
  { stroke: '#3b82f6', label: 'Архитектура' },
  { stroke: '#f59e0b', label: 'Интеграция' },
  { stroke: '#22c55e', label: 'Защита' },
  { stroke: '#a855f7', label: 'Атака' },
  { stroke: '#ef4444', label: 'Уязвимость' },
  { stroke: '#06b6d4', label: 'Данные' },
  { stroke: '#ec4899', label: 'Модель' },
  { stroke: '#84cc16', label: 'Мониторинг' },
];

const ROLE_SYMBOLS: Record<string, string> = {
  center: '\u2295',   // ⊕
  topic: '\u25C9',    // ◉
  child: '\u25CB',    // ○
};

export function KnowledgeMapDiagram({ data }: { data: KnowledgeMapData }) {
  const topics = data.topics;
  const cx = 440;
  const cy = 340;
  const ORBIT_R = 180;
  const SUB_ORBIT_R = 85;
  const CENTER_R = 40;
  const TOPIC_R = 28;
  const SUB_R = 20;

  const PAD = 60;
  const vbW = cx * 2 + PAD * 2;
  const vbH = cy * 2 + PAD * 2;
  const ox = -PAD + (cx - 440);
  const oy = -PAD + (cy - 340);

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const legend: GraphLegend[] = [];

  // Center node
  nodes.push({
    id: 'center',
    label: data.center,
    x: cx,
    y: cy,
    symbol: ROLE_SYMBOLS.center,
    color: '#6366f1',
    role: 'Центр',
    description: `Центральная тема: ${data.center}. Нажмите на связанные узлы, чтобы узнать подробности о каждом аспекте.`,
    radius: CENTER_R,
  });

  // Topic nodes + children
  topics.forEach((topic, i) => {
    const angle = (2 * Math.PI * i) / topics.length - Math.PI / 2;
    const tx = cx + ORBIT_R * Math.cos(angle);
    const ty = cy + ORBIT_R * Math.sin(angle);
    const color = TOPIC_COLORS[i % TOPIC_COLORS.length].stroke;

    // Clamp positions within viewBox
    const clampedTx = Math.max(ox + TOPIC_R + 10, Math.min(ox + vbW - TOPIC_R - 10, tx));
    const clampedTy = Math.max(oy + TOPIC_R + 10, Math.min(oy + vbH - TOPIC_R - 10, ty));

    nodes.push({
      id: `topic-${i}`,
      label: topic.label,
      x: clampedTx,
      y: clampedTy,
      symbol: ROLE_SYMBOLS.topic,
      color,
      role: 'Тема',
      description: `Тема: ${topic.label}. Область знаний, связанная с центральной темой «${data.center}».`,
      radius: TOPIC_R,
    });

    links.push({
      from: 'center',
      to: `topic-${i}`,
      color,
      animated: false,
    });

    // Legend entry
    if (i < 6) {
      legend.push({ color, label: topic.label.length > 12 ? topic.label.slice(0, 11) + '…' : topic.label });
    }

    // Children
    const children = topic.children || [];
    children.forEach((child, j) => {
      const childCount = children.length;
      const spreadAngle = childCount <= 1 ? 0 : (j - (childCount - 1) / 2) * 0.5;
      const childAngle = angle + spreadAngle;
      let sx = clampedTx + SUB_ORBIT_R * Math.cos(childAngle);
      let sy = clampedTy + SUB_ORBIT_R * Math.sin(childAngle);

      // Clamp within viewBox
      sx = Math.max(ox + SUB_R + 10, Math.min(ox + vbW - SUB_R - 10, sx));
      sy = Math.max(oy + SUB_R + 10, Math.min(oy + vbH - SUB_R - 10, sy));

      nodes.push({
        id: `child-${i}-${j}`,
        label: child,
        x: sx,
        y: sy,
        symbol: ROLE_SYMBOLS.child,
        color,
        role: 'Подтема',
        description: `Подтема «${child}» в рамках темы «${topic.label}». Связана с центральной темой «${data.center}».`,
        radius: SUB_R,
      });

      links.push({
        from: `topic-${i}`,
        to: `child-${i}-${j}`,
        color,
        animated: false,
      });
    });
  });

  return (
    <GraphDiagram
      nodes={nodes}
      links={links}
      legend={legend}
      viewBox={{ x: ox, y: oy, w: vbW, h: vbH }}
    />
  );
}
