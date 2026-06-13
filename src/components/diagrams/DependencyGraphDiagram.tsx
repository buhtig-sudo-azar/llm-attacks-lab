'use client';

import { DependencyNode, DependencyGraphData } from '@/types';

const LEVEL_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

const NODE_H = 40;
const NODE_W = 180;
const H_GAP = 16;
const V_GAP = 56;
const SIDE_PAD = 40;

interface LayoutNode {
  x: number;
  y: number;
  w: number;
  label: string;
  detail?: string;
  color: string;
  children: LayoutNode[];
  subtreeW: number;
}

function measureSubtreeWidth(node: DependencyNode, depth: number): number {
  if (!node.children || node.children.length === 0) {
    return NODE_W;
  }
  const childrenWidth = node.children.reduce(
    (sum, child) => sum + measureSubtreeWidth(child, depth + 1) + H_GAP,
    -H_GAP
  );
  return Math.max(NODE_W, childrenWidth);
}

function layoutTree(node: DependencyNode, x: number, y: number, depth: number): LayoutNode {
  const color = LEVEL_COLORS[depth % LEVEL_COLORS.length];
  const subtreeW = measureSubtreeWidth(node, depth);

  if (!node.children || node.children.length === 0) {
    // Center leaf node within its allocated subtree width
    const nodeX = x + (subtreeW - NODE_W) / 2;
    return { x: nodeX, y, w: NODE_W, label: node.label, detail: node.detail, color, children: [], subtreeW };
  }

  const childWidths = node.children.map(c => measureSubtreeWidth(c, depth + 1));
  const totalChildrenWidth = childWidths.reduce((s, w) => s + w, 0) + (node.children.length - 1) * H_GAP;
  const startX = x + (subtreeW - totalChildrenWidth) / 2;

  let childX = startX;
  const children: LayoutNode[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const cw = childWidths[i];
    children.push(layoutTree(node.children[i], childX, y + NODE_H + V_GAP, depth + 1));
    childX += cw + H_GAP;
  }

  // Center parent node over its children
  const firstChild = children[0];
  const lastChild = children[children.length - 1];
  const childrenCenterX = (firstChild.x + firstChild.w / 2 + lastChild.x + lastChild.w / 2) / 2;
  const nodeX = childrenCenterX - NODE_W / 2;

  return {
    x: nodeX,
    y,
    w: NODE_W,
    label: node.label,
    detail: node.detail,
    color,
    children,
    subtreeW,
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

  return (
    <g>
      {/* Curved lines to children */}
      {node.children.map((child, i) => {
        const childCx = child.x + child.w / 2;
        const childCy = child.y + NODE_H / 2;
        const midY = cy + (childCy - cy) / 2;
        return (
          <path key={i}
            d={`M${cx},${cy + NODE_H / 2} C${cx},${midY} ${childCx},${midY} ${childCx},${child.y}`}
            stroke={child.color} strokeWidth={1.5} strokeOpacity={0.4} fill="none"
          />
        );
      })}

      {/* Node box */}
      <rect x={node.x} y={node.y} width={node.w} height={NODE_H} rx={10}
        fill={node.color} fillOpacity={0.08}
        stroke={node.color} strokeWidth={1.5}
      />
      <rect x={node.x + 6} y={node.y + NODE_H / 2 - 6} width={3} height={12} rx={1.5} fill={node.color} />
      <text x={node.x + 18} y={cy - 2} fill={node.color} fontSize={12} fontWeight={700} dominantBaseline="middle">
        {node.label}
      </text>
      {node.detail && (
        <text x={node.x + 18} y={cy + 12} fill="#64748b" fontSize={9} dominantBaseline="middle">
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
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 580 }}>
      <defs>
        <filter id="dg-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation={2} floodOpacity={0.06} />
        </filter>
      </defs>
      <TreeNode node={root} />
    </svg>
  );
}
