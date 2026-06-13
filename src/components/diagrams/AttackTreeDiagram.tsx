'use client';

import { AttackTreeData } from '@/types';

const BRANCH_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
const ITEM_H = 30;
const ITEM_GAP = 6;
const ITEM_PAD = 12;
const BRANCH_HEADER_H = 36;
const BRANCH_GAP = 20;
const SIDE_PAD = 40;

export function AttackTreeDiagram({ data }: { data: AttackTreeData }) {
  const branches = data.branches;
  const maxItems = Math.max(...branches.map(b => b.items.length));
  const branchW = 180;
  const contentH = maxItems * (ITEM_H + ITEM_GAP) - ITEM_GAP;
  const branchH = BRANCH_HEADER_H + contentH + ITEM_PAD;
  const svgW = SIDE_PAD + branches.length * (branchW + BRANCH_GAP) - BRANCH_GAP + SIDE_PAD;
  const svgH = 60 + BRANCH_HEADER_H + 20 + branchH + 30;
  const rootCx = svgW / 2;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 580 }}>
      <defs>
        <filter id="at-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity={0.06} />
        </filter>
      </defs>

      {/* Root node */}
      <rect x={rootCx - 140} y={16} width={280} height={44} rx={22}
        fill="#ef4444" fillOpacity={0.1} stroke="#ef4444" strokeWidth={2} filter="url(#at-shadow)" />
      <text x={rootCx} y={42} textAnchor="middle" fill="#ef4444" fontSize={15} fontWeight={800} dominantBaseline="middle">
        {data.root}
      </text>

      {/* Branches */}
      {branches.map((branch, i) => {
        const bx = SIDE_PAD + i * (branchW + BRANCH_GAP);
        const by = 90;
        const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
        const branchCx = bx + branchW / 2;

        // Center items vertically within the branch
        const itemsCount = branch.items.length;
        const itemsTotalH = itemsCount * ITEM_H + (itemsCount - 1) * ITEM_GAP;
        const availableH = maxItems * ITEM_H + (maxItems - 1) * ITEM_GAP;
        const offsetY = (availableH - itemsTotalH) / 2;

        return (
          <g key={i}>
            {/* Connection from root */}
            <path d={`M${rootCx},${60} C${rootCx},${75} ${branchCx},${75} ${branchCx},${by}`}
              stroke={color} strokeWidth={1.5} strokeOpacity={0.5} fill="none" />

            {/* Branch container */}
            <rect x={bx} y={by} width={branchW} height={branchH} rx={12}
              fill={color} fillOpacity={0.03} stroke={color} strokeWidth={1} strokeDasharray="4,2" />

            {/* Branch header */}
            <rect x={bx + 8} y={by + 8} width={branchW - 16} height={BRANCH_HEADER_H - 16} rx={8}
              fill={color} fillOpacity={0.12} />
            <text x={branchCx} y={by + BRANCH_HEADER_H / 2 + 2} textAnchor="middle" fill={color} fontSize={12} fontWeight={700} dominantBaseline="middle">
              {branch.label}
            </text>

            {/* Items — vertically centered */}
            {branch.items.map((item, j) => {
              const iy = by + BRANCH_HEADER_H + ITEM_PAD / 2 + offsetY + j * (ITEM_H + ITEM_GAP) + ITEM_H / 2;
              return (
                <g key={j}>
                  {j > 0 && (
                    <line x1={branchCx} y1={iy - ITEM_H / 2 - ITEM_GAP / 2} x2={branchCx} y2={iy - ITEM_H / 2}
                      stroke={color} strokeWidth={1} strokeOpacity={0.3} />
                  )}
                  <rect x={bx + 12} y={iy - ITEM_H / 2 + 2} width={branchW - 24} height={ITEM_H - 4} rx={8}
                    fill={color} fillOpacity={0.06} stroke={color} strokeWidth={1} />
                  <rect x={bx + 18} y={iy - 4} width={3} height={8} rx={1.5} fill={color} />
                  <text x={bx + 30} y={iy + 2} fill={color} fontSize={11} fontWeight={600} dominantBaseline="middle">
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
