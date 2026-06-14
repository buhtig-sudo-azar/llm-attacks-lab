'use client';

import { DependencyNode, DependencyGraphData } from '@/types';
import { GraphDiagram, GraphNode, GraphLink, GraphLegend } from './GraphDiagram';

const LEVEL_COLORS = [
  '#3b82f6', // root blue
  '#64748b', // default
  '#f59e0b', // amber
  '#22c55e', // green
  '#ef4444', // red
];

const LEVEL_SYMBOLS = ['\u2295', '\u25CF', '\u25CB', '\u25A1', '\u25A1']; // ⊕ ● ○ □ □
const LEVEL_ROLES = ['Корень', 'Зависимость', 'Компонент', 'Подкомпонент', 'Элемент'];

interface LayoutResult {
  nodes: GraphNode[];
  links: GraphLink[];
  maxWidth: number;
  maxHeight: number;
}

function layoutDependencyTree(
  depNode: DependencyNode,
  x: number,
  y: number,
  depth: number,
  idPrefix: string,
): LayoutResult {
  const id = idPrefix;
  const color = LEVEL_COLORS[Math.min(depth, LEVEL_COLORS.length - 1)];
  const symbol = LEVEL_SYMBOLS[Math.min(depth, LEVEL_SYMBOLS.length - 1)];
  const role = LEVEL_ROLES[Math.min(depth, LEVEL_ROLES.length - 1)];
  const radius = depth === 0 ? 34 : depth === 1 ? 24 : 20;

  const node: GraphNode = {
    id,
    label: depNode.label,
    x,
    y,
    symbol,
    color,
    role,
    description: depNode.detail
      ? `${depNode.label} — ${depNode.detail}`
      : `${role}: ${depNode.label}. Элемент дерева зависимостей.`,
    radius,
  };

  const children = depNode.children ?? [];

  if (children.length === 0) {
    return {
      nodes: [node],
      links: [],
      maxWidth: x + 200,
      maxHeight: y + 50,
    };
  }

  // Layout children
  const childSpacing = 240;
  const childY = y + 110;
  const totalChildWidth = children.length * childSpacing;
  const startX = x - totalChildWidth / 2 + childSpacing / 2;

  let allNodes: GraphNode[] = [node];
  let allLinks: GraphLink[] = [];
  let maxW = x + 200;
  let maxH = y + 50;

  children.forEach((child, i) => {
    const childX = startX + i * childSpacing;
    const childId = `${id}-${i}`;

    allLinks.push({
      from: id,
      to: childId,
      color,
      animated: false,
    });

    const childResult = layoutDependencyTree(child, childX, childY, depth + 1, childId);
    allNodes = allNodes.concat(childResult.nodes);
    allLinks = allLinks.concat(childResult.links);
    maxW = Math.max(maxW, childResult.maxWidth);
    maxH = Math.max(maxH, childResult.maxHeight);
  });

  return {
    nodes: allNodes,
    links: allLinks,
    maxWidth: maxW,
    maxHeight: maxH,
  };
}

export function DependencyGraphDiagram({ data }: { data: DependencyGraphData }) {
  const PAD = 80;
  const startX = 500;
  const startY = PAD + 40;

  const result = layoutDependencyTree(data.root, startX, startY, 0, 'root');

  const svgW = result.maxWidth + PAD * 2;
  const svgH = result.maxHeight + PAD + 60;

  const legend: GraphLegend[] = [
    { color: LEVEL_COLORS[0], label: 'Корень' },
    { color: LEVEL_COLORS[1], label: 'Зависимость' },
    { color: LEVEL_COLORS[2], label: 'Компонент' },
  ];

  return (
    <GraphDiagram
      nodes={result.nodes}
      links={result.links}
      legend={legend}
      viewBox={{ x: 0, y: 0, w: svgW, h: svgH }}
    />
  );
}
