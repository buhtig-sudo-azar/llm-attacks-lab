'use client';

import { DependencyNode, DependencyGraphData } from '@/types';

const LEVEL_COLORS = [
  { fill: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8', shadow: 'rgb(59 130 246 / 0.15)' },   // root blue
  { fill: '#f8fafc', stroke: '#e2e8f0', text: '#334155', shadow: 'rgb(0 0 0 / 0.06)' },        // default
  { fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e', shadow: 'rgb(245 158 11 / 0.12)' },   // amber
  { fill: '#f0fdf4', stroke: '#22c55e', text: '#166534', shadow: 'rgb(34 197 94 / 0.12)' },    // green
  { fill: '#fef2f2', stroke: '#ef4444', text: '#991b1b', shadow: 'rgb(239 68 68 / 0.12)' },    // red
];

const NODE_H = 44;
const NODE_MIN_W = 160;
const NODE_PAD_X = 20;
const NODE_PAD_Y = 12;
const H_GAP = 24;
const V_GAP = 64;
const SIDE_PAD = 32;

interface LayoutNode {
  x: number;
  y: number;
  w: number;
  label: string;
  detail?: string;
  depth: number;
  children: LayoutNode[];
}

function measureNodeWidth(label: string, detail?: string): number {
  const labelW = label.length * 7.5 + NODE_PAD_X * 2;
  const detailW = detail ? detail.length * 5.5 + NODE_PAD_X * 2 : 0;
  return Math.max(NODE_MIN_W, labelW, detailW);
}

function measureSubtreeWidth(node: DependencyNode, depth: number): number {
  const nw = measureNodeWidth(node.label, node.detail);
  if (!node.children || node.children.length === 0) return nw;
  let totalW = 0;
  for (let i = 0; i < node.children.length; i++) {
    totalW += measureSubtreeWidth(node.children[i], depth + 1);
    if (i < node.children.length - 1) totalW += H_GAP;
  }
  return Math.max(nw, totalW);
}

function layoutTree(node: DependencyNode, x: number, y: number, depth: number): LayoutNode {
  const subtreeW = measureSubtreeWidth(node, depth);
  const nw = measureNodeWidth(node.label, node.detail);

  if (!node.children || node.children.length === 0) {
    return {
      x: x + (subtreeW - nw) / 2,
      y,
      w: nw,
      label: node.label,
      detail: node.detail,
      depth,
      children: [],
    };
  }

  let totalChildW = 0;
  const childWidths = node.children.map(c => measureSubtreeWidth(c, depth + 1));
  for (let i = 0; i < childWidths.length; i++) {
    totalChildW += childWidths[i];
    if (i < childWidths.length - 1) totalChildW += H_GAP;
  }

  let childX = x + (subtreeW - totalChildW) / 2;
  const children: LayoutNode[] = [];
  for (let i = 0; i < node.children.length; i++) {
    children.push(layoutTree(node.children[i], childX, y + NODE_H + V_GAP, depth + 1));
    childX += childWidths[i] + H_GAP;
  }

  // Center parent over children
  const first = children[0];
  const last = children[children.length - 1];
  const childrenCenter = (first.x + first.w / 2 + last.x + last.w / 2) / 2;

  return {
    x: childrenCenter - nw / 2,
    y,
    w: nw,
    label: node.label,
    detail: node.detail,
    depth,
    children,
  };
}

function getMaxDimensions(node: LayoutNode): { width: number; height: number } {
  let maxW = node.x + node.w;
  let maxH = node.y + NODE_H;
  for (const child of node.children) {
    const dims = getMaxDimensions(child);
    maxW = Math.max(maxW, dims.width);
    maxH = Math.max(maxH, dims.height);
  }
  return { width: maxW, height: maxH };
}

function TreeNode({ node }: { node: LayoutNode }) {
  const cx = node.x + node.w / 2;
  const cy = node.y + NODE_H / 2;
  const isRoot = node.depth === 0;
  const colors = LEVEL_COLORS[Math.min(node.depth, LEVEL_COLORS.length - 1)];
  const hasDetail = !!node.detail;
  const nodeH = hasDetail ? NODE_H + 16 : NODE_H;

  return (
    <g>
      {/* Bezier connectors to children */}
      {node.children.map((child, i) => {
        const ccx = child.x + child.w / 2;
        const ccy = child.y;
        const midY = cy + nodeH / 2 + (ccy - cy - nodeH / 2) / 2;
        return (
          <path key={i}
            d={`M${cx},${cy + nodeH / 2} C${cx},${midY} ${ccx},${midY} ${ccx},${ccy}`}
            stroke="#cbd5e1" strokeWidth="1.5" fill="none"
          />
        );
      })}

      {/* Node rectangle */}
      <rect
        x={node.x} y={node.y}
        width={node.w} height={nodeH}
        rx={10}
        fill={isRoot ? colors.fill : '#ffffff'}
        stroke={colors.stroke}
        strokeWidth={isRoot ? 2 : 1.5}
      />

      {/* Colored left accent for root */}
      {isRoot && (
        <rect x={node.x} y={node.y} width={4} height={nodeH} rx={2} fill={colors.stroke} />
      )}

      {/* Label */}
      <text
        x={isRoot ? node.x + NODE_PAD_X + 4 : cx}
        y={hasDetail ? cy - 3 : cy}
        textAnchor={isRoot ? 'start' : 'middle'}
        dominantBaseline="middle"
        fill={colors.text}
        fontSize="13" fontWeight={isRoot ? 700 : 600}
      >
        {node.label}
      </text>

      {/* Detail */}
      {node.detail && (
        <text
          x={isRoot ? node.x + NODE_PAD_X + 4 : cx}
          y={cy + 13}
          textAnchor={isRoot ? 'start' : 'middle'}
          fill="#94a3b8" fontSize="10"
        >
          {node.detail}
        </text>
      )}

      {/* Children */}
      {node.children.map((child, i) => (
        <TreeNode key={i} node={child} />
      ))}
    </g>
  );
}

export function DependencyGraphDiagram({ data }: { data: DependencyGraphData }) {
  const root = layoutTree(data.root, SIDE_PAD, 24, 0);
  const dims = getMaxDimensions(root);
  const svgW = dims.width + SIDE_PAD;
  const svgH = dims.height + 24;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      <defs>
        <filter id="dg-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#000" floodOpacity="0.07" />
        </filter>
        <filter id="dg-root-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.15" />
        </filter>
      </defs>
      <TreeNode node={root} />
    </svg>
  );
}
