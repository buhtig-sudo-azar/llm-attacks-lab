'use client';

import { ProcessingFlowDiagramData } from '@/types';

const NODE_PAD_X = 16;
const NODE_PAD_Y = 8;
const NODE_H = 32;
const FONT_SIZE = 12;
const DETAIL_SIZE = 9;
const STEP_GAP = 32;
const SIDE_PAD = 48;

function measureStepWidth(step: { label: string; detail?: string; branchLabel?: string }): number {
  const labelW = step.label.length * FONT_SIZE * 0.6;
  const detailW = step.detail ? step.detail.length * DETAIL_SIZE * 0.55 : 0;
  const branchW = step.branchLabel ? step.branchLabel.length * 9 * 0.6 + 16 : 0;
  return Math.max(labelW, detailW) + NODE_PAD_X * 2 + branchW;
}

export function ProcessingFlowDiagram({ data }: { data: ProcessingFlowDiagramData }) {
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
        const isInput = step.role === 'input';
        const isDanger = step.role === 'danger';
        const isDecision = step.role === 'decision';
        const isSuccess = step.role === 'success';

        // Determine border color
        let borderColor = '#94a3b8';
        let textColor = '#334155';
        let bgColor = 'transparent';
        let bgOpacity = 0;
        if (isInput) { borderColor = '#3b82f6'; textColor = '#3b82f6'; bgColor = '#3b82f6'; bgOpacity = 0.04; }
        if (isDanger) { borderColor = '#ef4444'; textColor = '#ef4444'; bgColor = '#ef4444'; bgOpacity = 0.04; }
        if (isSuccess) { borderColor = '#10b981'; textColor = '#10b981'; bgColor = '#10b981'; bgOpacity = 0.04; }
        if (isDecision) { borderColor = '#8b5cf6'; textColor = '#8b5cf6'; bgColor = '#8b5cf6'; bgOpacity = 0.04; }

        const sw = measureStepWidth(step);
        const isPill = isInput || isSuccess;
        const rx = isPill ? nh / 2 : 4;

        return (
          <g key={i}>
            {/* Connector */}
            {prevY !== null && (
              <line x1={cx} y1={prevY + (step.detail ? NODE_H + 14 : NODE_H) / 2 + 2} x2={cx} y2={y - nh / 2 - 2}
                stroke="#94a3b8" strokeWidth={1} />
            )}

            {/* Branch label */}
            {step.branchLabel && (
              <g>
                <text
                  x={cx + sw / 2 + 8} y={y + 1}
                  fill={borderColor} fontSize={9} fontWeight={500} dominantBaseline="middle"
                >
                  {step.branchLabel}
                </text>
              </g>
            )}

            {/* Node */}
            <rect
              x={cx - sw / 2} y={y - nh / 2}
              width={sw} height={nh}
              rx={rx}
              fill={bgColor} fillOpacity={bgOpacity}
              stroke={borderColor} strokeWidth={1}
            />

            {/* Label */}
            <text
              x={cx} y={hasDetail ? y - 4 : y}
              textAnchor="middle" dominantBaseline="middle"
              fill={textColor} fontSize={FONT_SIZE} fontWeight={isInput || isDanger ? 600 : 500}
            >
              {step.label}
            </text>

            {/* Detail */}
            {step.detail && (
              <text x={cx} y={y + 12} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={DETAIL_SIZE}>
                {step.detail}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
