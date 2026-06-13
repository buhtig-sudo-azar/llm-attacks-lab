'use client';

import { ProcessingFlowDiagramData } from '@/types';

const ROLE_STYLES: Record<string, { bg: string; border: string; text: string; shape: 'rect' | 'pill' | 'diamond' }> = {
  input:    { bg: '#3b82f6', border: '#3b82f6', text: '#3b82f6', shape: 'pill' },
  process:  { bg: '#f59e0b', border: '#f59e0b', text: '#f59e0b', shape: 'rect' },
  decision: { bg: '#8b5cf6', border: '#8b5cf6', text: '#8b5cf6', shape: 'diamond' },
  output:   { bg: '#64748b', border: '#64748b', text: '#64748b', shape: 'rect' },
  danger:   { bg: '#ef4444', border: '#ef4444', text: '#ef4444', shape: 'rect' },
  success:  { bg: '#10b981', border: '#10b981', text: '#10b981', shape: 'pill' },
  warning:  { bg: '#f59e0b', border: '#f59e0b', text: '#f59e0b', shape: 'rect' },
  neutral:  { bg: '#64748b', border: '#64748b', text: '#64748b', shape: 'rect' },
};

const NODE_H = 48;
const NODE_W = 260;
const GAP = 18;
const SIDE_PAD = 60;

export function ProcessingFlowDiagram({ data }: { data: ProcessingFlowDiagramData }) {
  const steps = data.steps;
  const svgW = NODE_W + SIDE_PAD * 2;
  const svgH = 24 + steps.length * (NODE_H + GAP) - GAP + 24;
  const cx = svgW / 2;

  function stepY(i: number) {
    return 24 + i * (NODE_H + GAP) + NODE_H / 2;
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 580 }}>
      <defs>
        <filter id="pf-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity={0.06} />
        </filter>
        <marker id="pf-arrow" viewBox="0 0 8 10" refX="4" refY="10" markerWidth="6" markerHeight="8" orient="auto">
          <path d="M0,0 L4,10 L8,0" fill="#94a3b8" />
        </marker>
      </defs>

      {steps.map((step, i) => {
        const style = ROLE_STYLES[step.role] || ROLE_STYLES.neutral;
        const y = stepY(i);
        const prevY = i > 0 ? stepY(i - 1) : null;
        const isDiamond = style.shape === 'diamond';
        const isPill = style.shape === 'pill';

        return (
          <g key={i}>
            {/* Connector line */}
            {prevY !== null && (
              <line x1={cx} y1={prevY + NODE_H / 2 + 2} x2={cx} y2={y - NODE_H / 2 - 2}
                stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#pf-arrow)" />
            )}

            {/* Branch label on the side */}
            {step.branchLabel && (
              <g>
                <rect x={cx + NODE_W / 2 + 8} y={y - 10} width={100} height={20} rx={10}
                  fill={style.bg} fillOpacity={0.08} stroke={style.border} strokeWidth={1} />
                <text x={cx + NODE_W / 2 + 58} y={y + 2} textAnchor="middle" fill={style.border} fontSize={9} fontWeight={600} dominantBaseline="middle">
                  {step.branchLabel}
                </text>
                <line x1={cx + NODE_W / 2} y1={y} x2={cx + NODE_W / 2 + 8} y2={y}
                  stroke={style.border} strokeWidth={1} strokeOpacity={0.5} />
              </g>
            )}

            {/* Diamond shape */}
            {isDiamond && (
              <g>
                <polygon
                  points={`${cx},${y - NODE_H / 2} ${cx + NODE_W / 2},${y} ${cx},${y + NODE_H / 2} ${cx - NODE_W / 2},${y}`}
                  fill={style.bg} fillOpacity={0.06}
                  stroke={style.border} strokeWidth={1.5}
                  filter="url(#pf-shadow)"
                />
                <text x={cx} y={y - 4} textAnchor="middle" fill={style.text} fontSize={13} fontWeight={700} dominantBaseline="middle">
                  {step.label}
                </text>
                {step.detail && (
                  <text x={cx} y={y + 12} textAnchor="middle" fill="#64748b" fontSize={10} dominantBaseline="middle">
                    {step.detail}
                  </text>
                )}
              </g>
            )}

            {/* Pill shape */}
            {isPill && (
              <g>
                <rect x={cx - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={NODE_H / 2}
                  fill={style.bg} fillOpacity={0.1}
                  stroke={style.border} strokeWidth={2}
                  filter="url(#pf-shadow)"
                />
                <text x={cx} y={y - 4} textAnchor="middle" fill={style.text} fontSize={13} fontWeight={700} dominantBaseline="middle">
                  {step.label}
                </text>
                {step.detail && (
                  <text x={cx} y={y + 12} textAnchor="middle" fill="#64748b" fontSize={10} dominantBaseline="middle">
                    {step.detail}
                  </text>
                )}
              </g>
            )}

            {/* Regular rectangle */}
            {!isDiamond && !isPill && (
              <g>
                <rect x={cx - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={12}
                  fill={style.bg} fillOpacity={0.06}
                  stroke={style.border} strokeWidth={1.5}
                  filter="url(#pf-shadow)"
                />
                <rect x={cx - NODE_W / 2 + 8} y={y - 8} width={4} height={16} rx={2} fill={style.border} />
                <text x={cx - NODE_W / 2 + 22} y={y - 2} fill={style.text} fontSize={13} fontWeight={700} dominantBaseline="middle">
                  {step.label}
                </text>
                {step.detail && (
                  <text x={cx - NODE_W / 2 + 22} y={y + 14} fill="#64748b" fontSize={10} dominantBaseline="middle">
                    {step.detail}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
