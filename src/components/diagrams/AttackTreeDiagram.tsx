'use client';

import { AttackTreeData } from '@/types';
import { GraphDiagram, GraphNode, GraphLink, GraphLegend } from './GraphDiagram';

const BRANCH_COLORS = [
  '#3b82f6', '#a855f7', '#f59e0b', '#22c55e', '#ef4444', '#06b6d4',
];

export function AttackTreeDiagram({ data }: { data: AttackTreeData }) {
  const branches = data.branches;
  const PAD = 80;
  const BRANCH_GAP = 120;
  const LEVEL_GAP = 120;

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const legend: GraphLegend[] = [];

  // Calculate layout
  const totalBranches = branches.length;
  const svgW = Math.max(800, totalBranches * 220 + PAD * 2);
  const svgH = 220 + LEVEL_GAP + branches.reduce((max, b) => Math.max(max, b.items.length), 0) * 90 + PAD * 2;

  const rootX = svgW / 2;
  const rootY = PAD + 40;

  // Root node
  nodes.push({
    id: 'root',
    label: data.root,
    x: rootX,
    y: rootY,
    symbol: '\u2694',  // ⚔
    color: '#ef4444',
    role: 'Цель атаки',
    description: `Цель атаки: ${data.root}. Это корневой узел дерева атак — основная угроза, которую может реализовать злоумышленник.`,
    radius: 34,
  });

  // Branch nodes
  branches.forEach((branch, i) => {
    const branchSpacing = svgW / (totalBranches + 1);
    const bx = branchSpacing * (i + 1);
    const by = rootY + LEVEL_GAP;
    const color = BRANCH_COLORS[i % BRANCH_COLORS.length];

    nodes.push({
      id: `branch-${i}`,
      label: branch.label,
      x: bx,
      y: by,
      symbol: '\u25C8', // ◈
      color,
      role: 'Вектор атаки',
      description: `Вектор атаки: ${branch.label}. Один из способов достижения цели «${data.root}».`,
      radius: 26,
    });

    links.push({
      from: 'root',
      to: `branch-${i}`,
      color,
      animated: true,
    });

    legend.push({ color, label: branch.label });

    // Item nodes
    branch.items.forEach((item, j) => {
      const iy = by + 85 * (j + 1);

      nodes.push({
        id: `item-${i}-${j}`,
        label: item,
        x: bx,
        y: iy,
        symbol: '\u25B8', // ▸
        color,
        role: 'Шаг атаки',
        description: `Шаг атаки: ${item}. Часть вектора «${branch.label}», направленного на «${data.root}».`,
        radius: 20,
      });

      links.push({
        from: `branch-${i}`,
        to: `item-${i}-${j}`,
        color,
      });
    });
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
