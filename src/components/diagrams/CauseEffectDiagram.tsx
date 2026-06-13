'use client';

import { CauseEffectData } from '@/types';

const NODE_PAD_X = 16;
const NODE_PAD_Y = 8;
const NODE_H = 32;
const FONT_SIZE = 12;
const DETAIL_SIZE = 9;
const STEP_GAP = 36;
const SIDE_PAD = 48;

function measureStepWidth(step: { label: string; detail?: string }): number {
  const labelW = step.label.length * FONT_SIZE * 0.6;
  const detailW = step.detail ? step.detail.length * DETAIL_SIZE * 0.55 : 0;
  return Math.max(labelW, detailW) + NODE_PAD_X * 2;
}

export function CauseEffectDiagram({ data }: { data: CauseEffectData }) {
  const steps = data.steps;
  const maxW = Math.max(...steps.map(measureStepWidth));
  const svgW = maxW + SIDE_PAD * 2;
  const cx = svgW / 2;
  const svgH = 16 + steps.length * (NODE_H + STEP_GAP) - STEP_GAP + 16;

  function stepY(i: number) {
    return 16 + i * (NODE_H + STEP_GAP) + NODE_H / 2;
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      {steps.map((step, i) => {
        const y = stepY(i);
        const prevY = i > 0 ? stepY(i - 1) : null;
        const hasDetail = !!step.detail;
        const nh = hasDetail ? NODE_H + 14 : NODE_H;
        const sw = measureStepWidth(step);

        // Color by role
        let borderColor = '#94a3b8';
        let textColor = '#334155';
        let bgColor = 'transparent';
        let bgOpacity = 0;
        let badgeText = '';

        if (step.role === 'cause') {
          borderColor = '#3b82f6'; textColor = '#3b82f6'; bgColor = '#3b82f6'; bgOpacity = 0.04; badgeText = 'причина';
        } else if (step.role === 'effect') {
          borderColor = '#f59e0b'; textColor = '#f59e0b'; bgColor = '#f59e0b'; bgOpacity = 0.04; badgeText = 'следствие';
        } else if (step.role === 'danger') {
          borderColor = '#ef4444'; textColor = '#ef4444'; bgColor = '#ef4444'; bgOpacity = 0.04; badgeText = 'угроза';
        }

        return (
          <g key={i}>
            {/* Connector */}
            {prevY !== null && (
              <g>
                <line x1={cx} y1={prevY + (steps[i - 1].detail ? NODE_H + 14 : NODE_H) / 2 + 2} x2={cx} y2={y - nh / 2 - 8}
                  stroke="#94a3b8" strokeWidth={1} />
                {/* Arrow head */}
                <polygon
                  points={`${cx - 4},${y - nh / 2 - 8} ${cx + 4},${y - nh / 2 - 8} ${cx},${y - nh / 2 - 2}`}
                  fill="#94a3b8"
                />
              </g>
            )}

            {/* Node frame */}
            <rect
              x={cx - sw / 2} y={y - nh / 2}
              width={sw} height={nh}
              rx={4}
              fill={bgColor} fillOpacity={bgOpacity}
              stroke={borderColor} strokeWidth={1}
            />

            {/* Role badge */}
            {badgeText && (
              <text
                x={cx - sw / 2 + 8} y={y - nh / 2 + 10}
                fill={borderColor} fontSize={8} fontWeight={600} dominantBaseline="middle"
                opacity={0.6}
              >
                {badgeText}
              </text>
            )}

            {/* Label */}
            <text
              x={cx} y={hasDetail ? y - 2 : y}
              textAnchor="middle" dominantBaseline="middle"
              fill={textColor} fontSize={FONT_SIZE} fontWeight={500}
            >
              {step.label}
            </text>

            {/* Detail */}
            {step.detail && (
              <text x={cx} y={y + 14} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={DETAIL_SIZE}>
                {step.detail}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
