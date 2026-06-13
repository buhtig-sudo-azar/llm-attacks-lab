'use client';

import { DependencyNode, DependencyGraphData } from '@/types';

const NODE_PAD_X = 16;
const NODE_PAD_Y = 8;
const NODE_H = 34;
const FONT_SIZE = 12;
const DETAIL_SIZE = 9;
const LEVEL_GAP = 52;
const SIBLING_GAP = 16;
const SIDE_PAD = 20;
const TOP_PAD = 16;

interface LayoutNode {
  x: number;
  y: number;
  w: number;
  label: string;
  detail?: string;
  children: LayoutNode[];
}

function measureNodeWidth(label: string, detail?: string): number {
  const labelW = label.length * FONT_SIZE * 0.6;
  const detailW = detail ? detail.length * DETAIL_SIZE * 0.55 : 0;
  return Math.max(labelW, detailW) + NODE_PAD_X * 2;
}

function measureSubtreeWidth(node: DependencyNode, depth: number): number {
  const nw = measureNodeWidth(node.label, node.detail);
  if (!node.children || node.children.length === 0) return nw;

  let totalW = 0;
  for (let i = 0; i < node.children.length; i++) {
    totalW += measureSubtreeWidth(node.children[i], depth + 1);
    if (i < node.children.length - 1) totalW += SIBLING_GAP;
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
      children: [],
    };
  }

  let totalChildW = 0;
  const childWidths = node.children.map(c => measureSubtreeWidth(c, depth + 1));
  for (let i = 0; i < childWidths.length; i++) {
    totalChildW += childWidths[i];
    if (i < childWidths.length - 1) totalChildW += SIBLING_GAP;
  }

  let childX = x + (subtreeW - totalChildW) / 2;
  const children: LayoutNode[] = [];
  for (let i = 0; i < node.children.length; i++) {
    children.push(layoutTree(node.children[i], childX, y + NODE_H + LEVEL_GAP, depth + 1));
    childX += childWidths[i] + SIBLING_GAP;
  }

  // Center parent over children
  const firstChild = children[0];
  const lastChild = children[children.length - 1];
  const childrenCenter = (firstChild.x + firstChild.w / 2 + lastChild.x + lastChild.w / 2) / 2;

  return {
    x: childrenCenter - nw / 2,
    y,
    w: nw,
    label: node.label,
    detail: node.detail,
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

function TreeNode({ node, depth }: { node: LayoutNode; depth: number }) {
  const cx = node.x + node.w / 2;
  const cy = node.y + NODE_H / 2;
  const isRoot = depth === 0;
  const hasDetail = !!node.detail;
  const nodeH = hasDetail ? NODE_H + 14 : NODE_H;

  return (
    <g>
      {/* Lines to children */}
      {node.children.map((child, i) => {
        const ccx = child.x + child.w / 2;
        const ccy = child.y;
        const midY = cy + nodeH / 2 + (ccy - cy - nodeH / 2) / 2;
        return (
          <path key={i}
            d={`M${cx},${cy + nodeH / 2} L${cx},${midY} L${ccx},${midY} L${ccx},${ccy}`}
            stroke="#94a3b8" strokeWidth={1} fill="none"
          />
        );
      })}

      {/* Frame */}
      <rect
        x={node.x} y={node.y}
        width={node.w} height={nodeH}
        rx={4}
        fill={isRoot ? '#3b82f6' : 'transparent'}
        fillOpacity={isRoot ? 0.06 : 0}
        stroke={isRoot ? '#3b82f6' : '#94a3b8'}
        strokeWidth={1}
      />

      {/* Label */}
      <text
        x={cx} y={hasDetail ? cy - 4 : cy}
        textAnchor="middle" dominantBaseline="middle"
        fill={isRoot ? '#3b82f6' : '#334155'}
        fontSize={FONT_SIZE} fontWeight={isRoot ? 700 : 500}
      >
        {node.label}
      </text>

      {/* Detail */}
      {node.detail && (
        <text
          x={cx} y={cy + 12}
          textAnchor="middle" dominantBaseline="middle"
          fill="#94a3b8" fontSize={DETAIL_SIZE}
        >
          {node.detail}
        </text>
      )}

      {/* Children */}
      {node.children.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </g>
  );
}

export function DependencyGraphDiagram({ data }: { data: DependencyGraphData }) {
  const root = layoutTree(data.root, SIDE_PAD, TOP_PAD, 0);
  const dims = getMaxDimensions(root);
  const svgW = dims.width + SIDE_PAD;
  const svgH = dims.height + TOP_PAD;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      <TreeNode node={root} depth={0} />
    </svg>
  );
}
