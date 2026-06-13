'use client';

import { CauseEffectData } from '@/types';

const ROLE_STYLES: Record<string, {
  fill: string; stroke: string; text: string; badge: string;
  shadowColor: string;
}> = {
  cause:  { fill: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8', badge: 'ПРИЧИНА', shadowColor: 'rgb(59 130 246 / 0.15)' },
  effect: { fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e', badge: 'СЛЕДСТВИЕ', shadowColor: 'rgb(245 158 11 / 0.15)' },
  danger: { fill: '#fef2f2', stroke: '#ef4444', text: '#991b1b', badge: 'УГРОЗА', shadowColor: 'rgb(239 68 68 / 0.2)' },
};

const NODE_W = 260;
const NODE_H = 56;
const STEP_GAP = 16;
const SIDE_PAD = 48;

export function CauseEffectDiagram({ data }: { data: CauseEffectData }) {
  const steps = data.steps;
  const svgW = NODE_W + SIDE_PAD * 2;
  const cx = svgW / 2;
  const svgH = 20 + steps.length * (NODE_H + STEP_GAP) - STEP_GAP + 20;

  function stepY(i: number) {
    return 20 + i * (NODE_H + STEP_GAP) + NODE_H / 2;
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      <defs>
        {/* Shadows per role */}
        <filter id="ce-cause-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.12" />
        </filter>
        <filter id="ce-effect-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.12" />
        </filter>
        <filter id="ce-danger-shadow" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="8" floodColor="#ef4444" floodOpacity="0.2" />
        </filter>

        {/* Arrow markers */}
        <marker id="ce-arrow" viewBox="0 0 10 7" refX={10} refY={3.5} markerWidth={10} markerHeight={7} orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
        <marker id="ce-arrow-red" viewBox="0 0 12 8" refX={12} refY={4} markerWidth={12} markerHeight={8} orient="auto">
          <polygon points="0 0, 12 4, 0 8" fill="#f87171" />
        </marker>
      </defs>

      {steps.map((step, i) => {
        const y = stepY(i);
        const prevY = i > 0 ? stepY(i - 1) : null;
        const style = ROLE_STYLES[step.role] || ROLE_STYLES.cause;
        const hasDetail = !!step.detail;
        const nh = hasDetail ? NODE_H + 14 : NODE_H;
        const isDanger = step.role === 'danger';
        const isEffect = step.role === 'effect';

        // Choose shadow filter
        let shadowFilter = 'url(#ce-cause-shadow)';
        if (isEffect) shadowFilter = 'url(#ce-effect-shadow)';
        if (isDanger) shadowFilter = 'url(#ce-danger-shadow)';

        // Choose arrow marker
        const nextIsDanger = i < steps.length - 1 && steps[i + 1].role === 'danger';
        const arrowMarker = nextIsDanger ? 'url(#ce-arrow-red)' : 'url(#ce-arrow)';
        const connectorColor = nextIsDanger ? '#f87171' : '#94a3b8';
        const connectorWidth = nextIsDanger ? 2.5 : 1.5;

        return (
          <g key={i}>
            {/* Connector */}
            {prevY !== null && (
              <line
                x1={cx} y1={prevY + (steps[i - 1].detail ? NODE_H + 14 : NODE_H) / 2 + 2}
                x2={cx} y2={y - nh / 2 - 4}
                stroke={connectorColor}
                strokeWidth={connectorWidth}
                markerEnd={arrowMarker}
              />
            )}

            {/* Node card */}
            <rect
              x={cx - NODE_W / 2} y={y - nh / 2}
              width={NODE_W} height={nh}
              rx={10}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={isDanger ? 2 : 1.5}
              filter={shadowFilter}
            />

            {/* Danger glow ring */}
            {isDanger && (
              <rect
                x={cx - NODE_W / 2 - 4} y={y - nh / 2 - 4}
                width={NODE_W + 8} height={nh + 8}
                rx={14}
                fill="none" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.15"
              />
            )}

            {/* Badge */}
            <rect
              x={cx - NODE_W / 2 + 12} y={y - nh / 2 + 8}
              width={style.badge.length * 6.5 + 12} height={18} rx={4}
              fill={style.stroke} fillOpacity="0.1"
            />
            <text
              x={cx - NODE_W / 2 + 12 + (style.badge.length * 6.5 + 12) / 2}
              y={y - nh / 2 + 17}
              textAnchor="middle" dominantBaseline="middle"
              fill={style.text} fontSize="8" fontWeight="700"
              letterSpacing="0.05em"
            >
              {style.badge}
            </text>

            {/* Label */}
            <text
              x={cx} y={hasDetail ? y - 2 : y + 4}
              textAnchor="middle" dominantBaseline="middle"
              fill={style.text} fontSize="13" fontWeight={isDanger ? 700 : 600}
            >
              {step.label}
            </text>

            {/* Detail */}
            {step.detail && (
              <text x={cx} y={y + 14} textAnchor="middle" dominantBaseline="middle"
                fill="#94a3b8" fontSize="10">
                {step.detail}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
