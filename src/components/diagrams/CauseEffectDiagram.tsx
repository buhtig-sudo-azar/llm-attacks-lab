'use client';

import { CauseEffectData } from '@/types';

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  cause:  { bg: '#3b82f6', border: '#3b82f6', text: '#3b82f6' },
  effect: { bg: '#f59e0b', border: '#f59e0b', text: '#f59e0b' },
  danger: { bg: '#ef4444', border: '#ef4444', text: '#ef4444' },
};

const NODE_H = 52;
const NODE_W = 240;
const GAP = 20;
const SIDE_PAD = 60;
const ARROW_LEN = 32;

export function CauseEffectDiagram({ data }: { data: CauseEffectData }) {
  const steps = data.steps;
  const svgW = NODE_W + SIDE_PAD * 2;
  const svgH = 20 + steps.length * (NODE_H + GAP + ARROW_LEN) - ARROW_LEN + 20;
  const cx = svgW / 2;

  function stepY(i: number) {
    return 20 + i * (NODE_H + GAP + ARROW_LEN) + NODE_H / 2;
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 580 }}>
      <defs>
        <filter id="ce-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation={3} floodOpacity={0.06} />
        </filter>
        <marker id="ce-arrow" viewBox="0 0 10 10" refX={10} refY={5} markerWidth={8} markerHeight={8} orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Vertical centerline */}
      {steps.length > 1 && (
        <line x1={cx} y1={stepY(0) + NODE_H / 2} x2={cx} y2={stepY(steps.length - 1) - NODE_H / 2}
          stroke="#e2e8f0" strokeWidth={2} />
      )}

      {steps.map((step, i) => {
        const y = stepY(i);
        const colors = ROLE_COLORS[step.role] || ROLE_COLORS.cause;
        const prevY = i > 0 ? stepY(i - 1) : null;

        return (
          <g key={i}>
            {/* Arrow from previous */}
            {prevY !== null && (
              <line x1={cx} y1={prevY + NODE_H / 2 + 2} x2={cx} y2={y - NODE_H / 2 - 8}
                stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#ce-arrow)" />
            )}

            {/* Step node — centered */}
            <rect x={cx - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={12}
              fill={colors.bg} fillOpacity={0.06}
              stroke={colors.border} strokeWidth={2}
              filter="url(#ce-shadow)"
            />

            {/* Left accent bar */}
            <rect x={cx - NODE_W / 2 + 8} y={y - 10} width={4} height={20} rx={2} fill={colors.border} />

            {/* Role badge — centered above label */}
            <rect x={cx - NODE_W / 2 + 20} y={y - NODE_H / 2 + 4} width={50} height={16} rx={8}
              fill={colors.bg} fillOpacity={0.15} />
            <text x={cx - NODE_W / 2 + 45} y={y - NODE_H / 2 + 13} textAnchor="middle" fill={colors.border} fontSize={8} fontWeight={700} dominantBaseline="middle">
              {step.role === 'cause' ? 'ПРИЧИНА' : step.role === 'effect' ? 'СЛЕДСТВИЕ' : 'УГРОЗА'}
            </text>

            {/* Label — centered */}
            <text x={cx} y={y + 2} textAnchor="middle" fill={colors.text} fontSize={13} fontWeight={700} dominantBaseline="middle">
              {step.label}
            </text>

            {/* Detail — centered */}
            {step.detail && (
              <text x={cx} y={y + 18} textAnchor="middle" fill="#64748b" fontSize={10} dominantBaseline="middle">
                {step.detail}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
