'use client';

import { AttackTreeData } from '@/types';

const NODE_PAD_X = 16;
const NODE_PAD_Y = 6;
const NODE_H = 30;
const BRANCH_H = 28;
const FONT_SIZE = 11;
const BRANCH_FONT = 11;
const ITEM_FONT = 11;
const LEVEL_GAP = 44;
const BRANCH_GAP = 20;
const SIDE_PAD = 24;
const TOP_PAD = 16;

export function AttackTreeDiagram({ data }: { data: AttackTreeData }) {
  const branches = data.branches;

  // Measure branch widths
  const branchWidths = branches.map(b => {
    const labelW = b.label.length * BRANCH_FONT * 0.6 + NODE_PAD_X * 2;
    const maxItemW = Math.max(...b.items.map(item => item.length * ITEM_FONT * 0.6 + NODE_PAD_X * 2 + 16));
    return Math.max(labelW, maxItemW);
  });

  const totalW = branchWidths.reduce((s, w) => s + w, 0) + (branches.length - 1) * BRANCH_GAP;
  const svgW = totalW + SIDE_PAD * 2;

  // Root node
  const rootW = data.root.length * FONT_SIZE * 0.6 + NODE_PAD_X * 2;
  const rootH = NODE_H + NODE_PAD_Y * 2;
  const rootCx = svgW / 2;
  const rootY = TOP_PAD;

  // Branches start
  const branchStartY = rootY + rootH + LEVEL_GAP;
  const maxItems = Math.max(...branches.map(b => b.items.length));

  const svgH = branchStartY + BRANCH_H + 12 + maxItems * (NODE_H + 8) + TOP_PAD;

  // Calculate branch X positions (centered)
  let bx = (svgW - totalW) / 2;
  const branchPositions = branchWidths.map((w, i) => {
    const x = bx;
    bx += w + BRANCH_GAP;
    return { x, w };
  });

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      {/* Root node */}
      <rect
        x={rootCx - rootW / 2} y={rootY}
        width={rootW} height={rootH}
        rx={4}
        fill="#ef4444" fillOpacity={0.06}
        stroke="#ef4444" strokeWidth={1}
      />
      <text
        x={rootCx} y={rootY + rootH / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill="#ef4444" fontSize={FONT_SIZE} fontWeight={700}
      >
        {data.root}
      </text>

      {/* Branches */}
      {branches.map((branch, i) => {
        const bp = branchPositions[i];
        const bcx = bp.x + bp.w / 2;

        return (
          <g key={i}>
            {/* Line from root to branch */}
            <path
              d={`M${rootCx},${rootY + rootH} L${rootCx},${rootY + rootH + LEVEL_GAP / 2} L${bcx},${rootY + rootH + LEVEL_GAP / 2} L${bcx},${branchStartY}`}
              stroke="#94a3b8" strokeWidth={1} fill="none"
            />

            {/* Branch header */}
            <rect
              x={bp.x} y={branchStartY}
              width={bp.w} height={BRANCH_H}
              rx={4}
              fill="#3b82f6" fillOpacity={0.06}
              stroke="#3b82f6" strokeWidth={1}
            />
            <text
              x={bcx} y={branchStartY + BRANCH_H / 2}
              textAnchor="middle" dominantBaseline="middle"
              fill="#3b82f6" fontSize={BRANCH_FONT} fontWeight={600}
            >
              {branch.label}
            </text>

            {/* Items */}
            {branch.items.map((item, j) => {
              const iy = branchStartY + BRANCH_H + 12 + j * (NODE_H + 8);
              return (
                <g key={j}>
                  {/* Vertical connector */}
                  {j > 0 && (
                    <line
                      x1={bcx} y1={iy - 8} x2={bcx} y2={iy}
                      stroke="#94a3b8" strokeWidth={1}
                    />
                  )}
                  {/* Horizontal stub + vertical from branch */}
                  {j === 0 && (
                    <line
                      x1={bcx} y1={branchStartY + BRANCH_H} x2={bcx} y2={iy}
                      stroke="#94a3b8" strokeWidth={1}
                    />
                  )}

                  {/* Item node */}
                  <rect
                    x={bp.x + 8} y={iy}
                    width={bp.w - 16} height={NODE_H}
                    rx={4}
                    fill="transparent"
                    stroke="#94a3b8" strokeWidth={1}
                  />
                  <text
                    x={bcx} y={iy + NODE_H / 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#334155" fontSize={ITEM_FONT}
                  >
                    {item}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
