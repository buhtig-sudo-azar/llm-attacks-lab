'use client';

import { KnowledgeMapData } from '@/types';

const NODE_PAD_X = 16;
const NODE_PAD_Y = 8;
const NODE_H = 32;
const FONT_SIZE = 12;
const LEVEL_GAP = 48;
const SIBLING_GAP = 20;
const INDENT = 24;
const SIDE_PAD = 20;
const TOP_PAD = 16;

interface TreeNode {
  label: string;
  children: TreeNode[];
  x: number;
  y: number;
  w: number;
}

function measureNodeWidth(label: string): number {
  return label.length * FONT_SIZE * 0.6 + NODE_PAD_X * 2;
}

function buildTree(data: KnowledgeMapData): TreeNode {
  const root: TreeNode = {
    label: data.center,
    children: data.topics.map(t => ({
      label: t.label,
      children: (t.children || []).map(c => ({ label: c, children: [], x: 0, y: 0, w: 0 })),
      x: 0, y: 0, w: 0,
    })),
    x: 0, y: 0, w: 0,
  };
  return root;
}

function measureTree(node: TreeNode): number {
  if (node.children.length === 0) {
    node.w = measureNodeWidth(node.label);
    return node.w;
  }
  let totalW = 0;
  for (let i = 0; i < node.children.length; i++) {
    totalW += measureTree(node.children[i]);
    if (i < node.children.length - 1) totalW += SIBLING_GAP;
  }
  node.w = Math.max(measureNodeWidth(node.label), totalW);
  return node.w;
}

function layoutTree(node: TreeNode, x: number, y: number): void {
  node.y = y;
  if (node.children.length === 0) {
    node.x = x + (node.w - measureNodeWidth(node.label)) / 2;
    return;
  }
  let totalChildW = 0;
  for (let i = 0; i < node.children.length; i++) {
    totalChildW += node.children[i].w;
    if (i < node.children.length - 1) totalChildW += SIBLING_GAP;
  }
  let cx = x + (node.w - totalChildW) / 2;
  for (const child of node.children) {
    layoutTree(child, cx, y + LEVEL_GAP);
    cx += child.w + SIBLING_GAP;
  }
  // Center parent over children
  const firstChild = node.children[0];
  const lastChild = node.children[node.children.length - 1];
  const childrenCenter = (firstChild.x + firstChild.w / 2 + lastChild.x + lastChild.w / 2) / 2;
  node.x = childrenCenter - measureNodeWidth(node.label) / 2;
}

function getMaxDimensions(node: TreeNode): { width: number; height: number } {
  let maxW = node.x + node.w;
  let maxH = node.y + NODE_H;
  for (const child of node.children) {
    const dims = getMaxDimensions(child);
    maxW = Math.max(maxW, dims.width);
    maxH = Math.max(maxH, dims.height);
  }
  return { width: maxW, height: maxH };
}

export function KnowledgeMapDiagram({ data }: { data: KnowledgeMapData }) {
  const root = buildTree(data);
  measureTree(root);
  layoutTree(root, SIDE_PAD, TOP_PAD);
  const dims = getMaxDimensions(root);
  const svgW = dims.width + SIDE_PAD;
  const svgH = dims.height + TOP_PAD;

  function renderNode(node: TreeNode, depth: number) {
    const nw = measureNodeWidth(node.label);
    const cx = node.x + nw / 2;
    const cy = node.y + NODE_H / 2;
    const isRoot = depth === 0;

    return (
      <g key={`${node.label}-${node.x}`}>
        {/* Connections to children */}
        {node.children.map((child, i) => {
          const ccx = child.x + measureNodeWidth(child.label) / 2;
          const ccy = child.y;
          const midY = cy + (ccy - cy) / 2;
          return (
            <g key={i}>
              <path
                d={`M${cx},${cy + NODE_H / 2} L${cx},${midY} L${ccx},${midY} L${ccx},${ccy}`}
                stroke="#94a3b8" strokeWidth={1} fill="none"
              />
            </g>
          );
        })}

        {/* Node frame */}
        <rect
          x={node.x} y={node.y}
          width={nw} height={NODE_H}
          rx={4}
          fill={isRoot ? '#3b82f6' : 'transparent'}
          fillOpacity={isRoot ? 0.06 : 0}
          stroke={isRoot ? '#3b82f6' : '#94a3b8'}
          strokeWidth={1}
        />

        {/* Label */}
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="middle"
          fill={isRoot ? '#3b82f6' : '#334155'}
          fontSize={FONT_SIZE} fontWeight={isRoot ? 700 : 500}
        >
          {node.label}
        </text>

        {/* Recurse children */}
        {node.children.map((child, i) => renderNode(child, depth + 1))}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      {renderNode(root, 0)}
    </svg>
  );
}
