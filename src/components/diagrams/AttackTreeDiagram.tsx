'use client';

import { AttackTreeData } from '@/types';

const BRANCH_COLORS = [
  { fill: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8' },   // blue
  { fill: '#faf5ff', stroke: '#a855f7', text: '#6b21a8' },   // purple
  { fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e' },   // amber
  { fill: '#f0fdf4', stroke: '#22c55e', text: '#166534' },   // green
  { fill: '#fef2f2', stroke: '#ef4444', text: '#991b1b' },   // red
  { fill: '#ecfeff', stroke: '#06b6d4', text: '#155e75' },   // cyan
];

const NODE_PAD_X = 16;
const NODE_H = 34;
const BRANCH_HEADER_H = 36;
const ITEM_GAP = 10;
const BRANCH_GAP = 28;
const LEVEL_GAP = 52;
const SIDE_PAD = 32;
const TOP_PAD = 20;

export function AttackTreeDiagram({ data }: { data: AttackTreeData }) {
  const branches = data.branches;

  // Measure branch widths
  const branchWidths = branches.map(b => {
    const labelW = b.label.length * 8 + NODE_PAD_X * 2;
    const maxItemW = Math.max(...b.items.map(item => item.length * 7 + NODE_PAD_X * 2 + 12));
    return Math.max(labelW, maxItemW, 140);
  });

  const totalW = branchWidths.reduce((s, w) => s + w, 0) + (branches.length - 1) * BRANCH_GAP;
  const svgW = totalW + SIDE_PAD * 2;

  // Root
  const rootW = data.root.length * 9 + 40;
  const rootH = 48;
  const rootCx = svgW / 2;
  const rootY = TOP_PAD;

  // Branches
  const branchStartY = rootY + rootH + LEVEL_GAP;
  const maxItems = Math.max(...branches.map(b => b.items.length));
  const branchContentH = maxItems * (NODE_H + ITEM_GAP) - ITEM_GAP;
  const branchH = BRANCH_HEADER_H + branchContentH + 16;

  const svgH = branchStartY + branchH + TOP_PAD;

  // Branch X positions (centered)
  let bx = (svgW - totalW) / 2;
  const branchPositions = branchWidths.map((w, i) => {
    const x = bx;
    bx += w + BRANCH_GAP;
    return { x, w };
  });

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      <defs>
        {/* Root glow */}
        <filter id="at-root-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.2" />
        </filter>

        {/* Node shadow */}
        <filter id="at-node-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.06" />
        </filter>

        {/* Branch header shadow */}
        <filter id="at-header-shadow" x="-5%" y="-10%" width="110%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#000" floodOpacity="0.05" />
        </filter>

        {/* Arrow marker */}
        <marker id="at-arrow" viewBox="0 0 10 7" refX={10} refY={3.5} markerWidth={8} markerHeight={6} orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
        </marker>
      </defs>

      {/* Root node */}
      <rect x={rootCx - rootW / 2} y={rootY} width={rootW} height={rootH} rx={24}
        fill="#fef2f2" stroke="#ef4444" strokeWidth={2}
        filter="url(#at-root-glow)"
      />
      <text x={rootCx} y={rootY + rootH / 2} textAnchor="middle" dominantBaseline="middle"
        fill="#991b1b" fontSize="14" fontWeight="700">
        {data.root}
      </text>

      {/* Branches */}
      {branches.map((branch, i) => {
        const bp = branchPositions[i];
        const bcx = bp.x + bp.w / 2;
        const colors = BRANCH_COLORS[i % BRANCH_COLORS.length];

        return (
          <g key={i}>
            {/* Bezier from root to branch */}
            <path
              d={`M${rootCx},${rootY + rootH} C${rootCx},${rootY + rootH + LEVEL_GAP / 2} ${bcx},${rootY + rootH + LEVEL_GAP / 2} ${bcx},${branchStartY}`}
              stroke={colors.stroke} strokeWidth="1.5" fill="none" strokeOpacity="0.5"
            />

            {/* Branch container (subtle background) */}
            <rect x={bp.x} y={branchStartY} width={bp.w} height={branchH} rx={12}
              fill={colors.fill} fillOpacity="0.4" stroke={colors.stroke} strokeWidth="1" strokeOpacity="0.2"
            />

            {/* Branch header */}
            <rect x={bp.x + 6} y={branchStartY + 6} width={bp.w - 12} height={BRANCH_HEADER_H - 12} rx={8}
              fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5"
              filter="url(#at-header-shadow)"
            />
            <text x={bcx} y={branchStartY + BRANCH_HEADER_H / 2 + 1} textAnchor="middle" dominantBaseline="middle"
              fill={colors.text} fontSize="12" fontWeight="700">
              {branch.label}
            </text>

            {/* Items */}
            {branch.items.map((item, j) => {
              const iy = branchStartY + BRANCH_HEADER_H + 8 + j * (NODE_H + ITEM_GAP);

              return (
                <g key={j}>
                  {/* Connector line */}
                  <line x1={bcx} y1={iy - ITEM_GAP} x2={bcx} y2={iy}
                    stroke={colors.stroke} strokeWidth="1" strokeOpacity="0.3"
                  />

                  {/* Item node — white card */}
                  <rect
                    x={bp.x + 10} y={iy} width={bp.w - 20} height={NODE_H} rx={8}
                    fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"
                    filter="url(#at-node-shadow)"
                  />

                  {/* Colored left dot */}
                  <circle cx={bp.x + 22} cy={iy + NODE_H / 2} r={3} fill={colors.stroke} />

                  {/* Item text */}
                  <text
                    x={bp.x + 34} y={iy + NODE_H / 2}
                    fill="#334155" fontSize="12" fontWeight="500" dominantBaseline="middle"
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
