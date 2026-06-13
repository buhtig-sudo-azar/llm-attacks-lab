'use client';

import { ProcessingFlowDiagramData } from '@/types';

const ROLE_STYLES: Record<string, {
  fill: string; stroke: string; text: string; numberBg: string; numberText: string;
  isPill?: boolean;
}> = {
  input:    { fill: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8', numberBg: '#3b82f6', numberText: '#ffffff', isPill: true },
  process:  { fill: '#ffffff', stroke: '#e2e8f0', text: '#334155', numberBg: '#f1f5f9', numberText: '#64748b' },
  decision: { fill: '#faf5ff', stroke: '#a855f7', text: '#6b21a8', numberBg: '#a855f7', numberText: '#ffffff' },
  output:   { fill: '#ffffff', stroke: '#e2e8f0', text: '#334155', numberBg: '#f1f5f9', numberText: '#64748b' },
  danger:   { fill: '#fef2f2', stroke: '#ef4444', text: '#991b1b', numberBg: '#ef4444', numberText: '#ffffff' },
  success:  { fill: '#f0fdf4', stroke: '#22c55e', text: '#166534', numberBg: '#22c55e', numberText: '#ffffff', isPill: true },
  warning:  { fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e', numberBg: '#f59e0b', numberText: '#ffffff' },
  neutral:  { fill: '#ffffff', stroke: '#e2e8f0', text: '#334155', numberBg: '#f1f5f9', numberText: '#64748b' },
};

const NODE_W = 280;
const NODE_H = 56;
const NUMBER_R = 14;
const STEP_GAP = 20;
const SIDE_PAD = 48;

export function ProcessingFlowDiagram({ data }: { data: ProcessingFlowDiagramData }) {
  const steps = data.steps;
  const svgW = NODE_W + SIDE_PAD * 2;
  const cx = svgW / 2;
  const svgH = 16 + steps.length * (NODE_H + STEP_GAP) - STEP_GAP + 16;

  function stepY(i: number) {
    return 16 + i * (NODE_H + STEP_GAP) + NODE_H / 2;
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      <defs>
        <filter id="pf-node-shadow" x="-8%" y="-8%" width="116%" height="124%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.06" />
        </filter>
        <filter id="pf-active-shadow" x="-8%" y="-8%" width="116%" height="124%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.15" />
        </filter>

        {/* Arrow marker */}
        <marker id="pf-arrow" viewBox="0 0 10 7" refX={10} refY={3.5} markerWidth={8} markerHeight={6} orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
        </marker>

        {/* Dot pattern for background */}
        <pattern id="pf-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.8" fill="#e2e8f0" opacity="0.5" />
        </pattern>
      </defs>

      {/* Background dot grid */}
      <rect width={svgW} height={svgH} fill="url(#pf-dots)" />

      {steps.map((step, i) => {
        const y = stepY(i);
        const prevY = i > 0 ? stepY(i - 1) : null;
        const style = ROLE_STYLES[step.role] || ROLE_STYLES.neutral;
        const isPill = style.isPill;
        const isActive = step.role === 'input';
        const hasDetail = !!step.detail;
        const nh = hasDetail ? NODE_H + 12 : NODE_H;
        const rx = isPill ? nh / 2 : 10;

        // Number badge position
        const numCx = cx - NODE_W / 2 + 24;
        const numCy = y;

        return (
          <g key={i}>
            {/* Connector line */}
            {prevY !== null && (
              <line x1={cx} y1={prevY + (steps[i - 1].detail ? NODE_H + 12 : NODE_H) / 2 + 2}
                x2={cx} y2={y - nh / 2 - 2}
                stroke="#cbd5e1" strokeWidth="1.5" markerEnd="url(#pf-arrow)"
              />
            )}

            {/* Node card */}
            <rect
              x={cx - NODE_W / 2} y={y - nh / 2}
              width={NODE_W} height={nh}
              rx={rx}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={isActive ? 2 : 1.5}
              filter={isActive ? 'url(#pf-active-shadow)' : 'url(#pf-node-shadow)'}
            />

            {/* Step number badge */}
            <circle cx={numCx} cy={numCy} r={NUMBER_R}
              fill={style.numberBg}
            />
            <text x={numCx} y={numCy + 1} textAnchor="middle" dominantBaseline="middle"
              fill={style.numberText} fontSize="11" fontWeight="700">
              {i + 1}
            </text>

            {/* Label */}
            <text
              x={numCx + NUMBER_R + 12} y={hasDetail ? y - 5 : y}
              fill={style.text} fontSize="13" fontWeight="600" dominantBaseline="middle"
            >
              {step.label}
            </text>

            {/* Detail */}
            {step.detail && (
              <text
                x={numCx + NUMBER_R + 12} y={y + 12}
                fill="#94a3b8" fontSize="10" dominantBaseline="middle"
              >
                {step.detail}
              </text>
            )}

            {/* Branch label */}
            {step.branchLabel && (
              <g>
                <rect x={cx + NODE_W / 2 + 8} y={y - 10} width={80} height={20} rx={4}
                  fill={style.fill} stroke={style.stroke} strokeWidth="1"
                />
                <text x={cx + NODE_W / 2 + 48} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill={style.text} fontSize="9" fontWeight="600">
                  {step.branchLabel}
                </text>
                <line x1={cx + NODE_W / 2} y1={y} x2={cx + NODE_W / 2 + 8} y2={y}
                  stroke={style.stroke} strokeWidth="1" strokeOpacity="0.5"
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
