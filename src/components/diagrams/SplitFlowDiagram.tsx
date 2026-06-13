'use client';

import { SplitFlowDiagramData, SplitFlowStep } from '@/types';

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  input:    { bg: '#3b82f6', border: '#3b82f6', text: '#fff',    icon: '📥' },
  process:  { bg: '#f59e0b', border: '#f59e0b', text: '#fff',    icon: '⚙️' },
  decision: { bg: '#8b5cf6', border: '#8b5cf6', text: '#fff',    icon: '🔀' },
  output:   { bg: '#64748b', border: '#64748b', text: '#fff',    icon: '📤' },
  danger:   { bg: '#ef4444', border: '#ef4444', text: '#fff',    icon: '⚠️' },
  success:  { bg: '#10b981', border: '#10b981', text: '#fff',    icon: '✅' },
  warning:  { bg: '#f59e0b', border: '#f59e0b', text: '#fff',    icon: '⚡' },
  neutral:  { bg: '#64748b', border: '#64748b', text: '#fff',    icon: '📄' },
};

const STEP_H = 52;
const STEP_GAP = 14;
const BRANCH_GAP = 40;
const HEADER_H = 48;
const INPUT_H = 56;
const CONCLUSION_H = 60;
const SIDE_PAD = 32;
const TOP_PAD = 24;

export function SplitFlowDiagram({ data }: { data: SplitFlowDiagramData }) {
  const maxSteps = Math.max(data.leftBranch.steps.length, data.rightBranch.steps.length);
  const leftW = 280;
  const rightW = 280;
  const svgW = SIDE_PAD + leftW + BRANCH_GAP + rightW + SIDE_PAD;
  const branchContentH = maxSteps * (STEP_H + STEP_GAP) - STEP_GAP;
  const branchH = HEADER_H + branchContentH + 16;
  const svgH = TOP_PAD + INPUT_H + 40 + branchH + 30 + (data.conclusion ? CONCLUSION_H + 10 : 0) + 16;

  const leftX = SIDE_PAD;
  const rightX = SIDE_PAD + leftW + BRANCH_GAP;
  const inputX = svgW / 2;
  const inputY = TOP_PAD + INPUT_H / 2;
  const branchStartY = TOP_PAD + INPUT_H + 40;
  const splitY = branchStartY - 10;

  const leftCx = leftX + leftW / 2;
  const rightCx = rightX + rightW / 2;

  function stepY(index: number) {
    return branchStartY + HEADER_H + 16 + index * (STEP_H + STEP_GAP) + STEP_H / 2;
  }

  function StepNode({ step, cx, y, w }: { step: SplitFlowStep; cx: number; y: number; w: number }) {
    const colors = ROLE_COLORS[step.role] || ROLE_COLORS.neutral;
    return (
      <g>
        <rect x={cx - w / 2} y={y - STEP_H / 2} width={w} height={STEP_H} rx={12}
          fill={colors.bg} fillOpacity={0.08} stroke={colors.border} strokeWidth={1.5} />
        <rect x={cx - w / 2 + 8} y={y - 8} width={4} height={16} rx={2} fill={colors.border} />
        <text x={cx - w / 2 + 22} y={y - 4} fill={colors.border} fontSize={13} fontWeight={700} dominantBaseline="middle">{step.label}</text>
        {step.detail && (
          <text x={cx - w / 2 + 22} y={y + 14} fill="#64748b" fontSize={10} dominantBaseline="middle">{step.detail}</text>
        )}
      </g>
    );
  }

  function VerticalDots({ x, fromY, toY }: { x: number; fromY: number; toY: number }) {
    const mid = (fromY + toY) / 2;
    return (
      <g>
        <circle cx={x} cy={mid - 8} r={2} fill="#94a3b8" />
        <circle cx={x} cy={mid} r={2} fill="#94a3b8" />
        <circle cx={x} cy={mid + 8} r={2} fill="#94a3b8" />
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 580 }}>
      <defs>
        <filter id="sf-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity={0.08} />
        </filter>
        <marker id="sf-arrow-left" viewBox="0 0 10 8" refX="10" refY="4" markerWidth="8" markerHeight="6" orient="auto">
          <path d="M0,0 L10,4 L0,8" fill="#f59e0b" />
        </marker>
        <marker id="sf-arrow-right" viewBox="0 0 10 8" refX="10" refY="4" markerWidth="8" markerHeight="6" orient="auto">
          <path d="M0,0 L10,4 L0,8" fill="#10b981" />
        </marker>
        <marker id="sf-arrow-down" viewBox="0 0 8 10" refX="4" refY="10" markerWidth="6" markerHeight="8" orient="auto">
          <path d="M0,0 L4,10 L8,0" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Input URL node */}
      <rect x={inputX - 160} y={TOP_PAD} width={320} height={INPUT_H} rx={28}
        fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={2} filter="url(#sf-shadow)" />
      <text x={inputX} y={inputY - 6} textAnchor="middle" fill="#3b82f6" fontSize={14} fontWeight={800} dominantBaseline="middle">
        {data.input.label}
      </text>
      {data.input.url && (
        <text x={inputX} y={inputY + 14} textAnchor="middle" fill="#64748b" fontSize={12} fontFamily="monospace" dominantBaseline="middle">
          {data.input.url}
        </text>
      )}

      {/* Split lines from input to branches */}
      <path d={`M${inputX},${TOP_PAD + INPUT_H} L${inputX},${splitY}`}
        stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4,3" />
      <path d={`M${inputX},${splitY} L${leftCx},${splitY} L${leftCx},${branchStartY}`}
        stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#sf-arrow-left)" />
      <path d={`M${inputX},${splitY} L${rightCx},${splitY} L${rightCx},${branchStartY}`}
        stroke="#10b981" strokeWidth={1.5} markerEnd="url(#sf-arrow-right)" />

      {/* Left branch container */}
      <rect x={leftX} y={branchStartY} width={leftW} height={branchH} rx={16}
        fill="#f59e0b" fillOpacity={0.03} stroke="#f59e0b" strokeWidth={1} strokeDasharray="6,3" />
      <rect x={leftX + 12} y={branchStartY + 8} width={leftW - 24} height={HEADER_H - 16} rx={10}
        fill="#f59e0b" fillOpacity={0.12} />
      <text x={leftCx} y={branchStartY + HEADER_H / 2 + 2} textAnchor="middle" fill="#f59e0b" fontSize={14} fontWeight={800} dominantBaseline="middle">
        {data.leftBranch.label}
      </text>
      {data.leftBranch.subtitle && (
        <text x={leftCx} y={branchStartY + HEADER_H / 2 + 18} textAnchor="middle" fill="#64748b" fontSize={9}>
          {data.leftBranch.subtitle}
        </text>
      )}

      {/* Left steps */}
      {data.leftBranch.steps.map((step, i) => (
        <g key={i}>
          {i > 0 && (
            <line x1={leftCx} y1={stepY(i - 1) + STEP_H / 2 + 2} x2={leftCx} y2={stepY(i) - STEP_H / 2 - 2}
              stroke="#f59e0b" strokeWidth={1} strokeOpacity={0.4} />
          )}
          <StepNode step={step} cx={leftCx} y={stepY(i)} w={leftW - 32} />
        </g>
      ))}

      {/* Right branch container */}
      <rect x={rightX} y={branchStartY} width={rightW} height={branchH} rx={16}
        fill="#10b981" fillOpacity={0.03} stroke="#10b981" strokeWidth={1} strokeDasharray="6,3" />
      <rect x={rightX + 12} y={branchStartY + 8} width={rightW - 24} height={HEADER_H - 16} rx={10}
        fill="#10b981" fillOpacity={0.12} />
      <text x={rightCx} y={branchStartY + HEADER_H / 2 + 2} textAnchor="middle" fill="#10b981" fontSize={14} fontWeight={800} dominantBaseline="middle">
        {data.rightBranch.label}
      </text>
      {data.rightBranch.subtitle && (
        <text x={rightCx} y={branchStartY + HEADER_H / 2 + 18} textAnchor="middle" fill="#64748b" fontSize={9}>
          {data.rightBranch.subtitle}
        </text>
      )}

      {/* Right steps */}
      {data.rightBranch.steps.map((step, i) => (
        <g key={i}>
          {i > 0 && (
            <line x1={rightCx} y1={stepY(i - 1) + STEP_H / 2 + 2} x2={rightCx} y2={stepY(i) - STEP_H / 2 - 2}
              stroke="#10b981" strokeWidth={1} strokeOpacity={0.4} />
          )}
          <StepNode step={step} cx={rightCx} y={stepY(i)} w={rightW - 32} />
        </g>
      ))}

      {/* Conclusion */}
      {data.conclusion && (() => {
        const cy = branchStartY + branchH + 30 + CONCLUSION_H / 2;
        return (
          <g>
            {/* Lines from branches down to conclusion */}
            <path d={`M${leftCx},${branchStartY + branchH} L${leftCx},${branchStartY + branchH + 14} L${inputX - 130},${branchStartY + branchH + 14} L${inputX - 130},${cy - CONCLUSION_H / 2 + 8}`}
              stroke="#f59e0b" strokeWidth={1} strokeOpacity={0.5} />
            <path d={`M${rightCx},${branchStartY + branchH} L${rightCx},${branchStartY + branchH + 14} L${inputX + 130},${branchStartY + branchH + 14} L${inputX + 130},${cy - CONCLUSION_H / 2 + 8}`}
              stroke="#10b981" strokeWidth={1} strokeOpacity={0.5} />

            {/* Left result */}
            <rect x={inputX - 230} y={cy - 22} width={190} height={44} rx={10}
              fill="#f59e0b" fillOpacity={0.1} stroke="#f59e0b" strokeWidth={1} />
            <text x={inputX - 135} y={cy - 2} textAnchor="middle" fill="#f59e0b" fontSize={11} fontWeight={700} dominantBaseline="middle">
              {data.conclusion.left}
            </text>

            {/* Right result */}
            <rect x={inputX + 40} y={cy - 22} width={190} height={44} rx={10}
              fill="#10b981" fillOpacity={0.1} stroke="#10b981" strokeWidth={1} />
            <text x={inputX + 135} y={cy - 2} textAnchor="middle" fill="#10b981" fontSize={11} fontWeight={700} dominantBaseline="middle">
              {data.conclusion.right}
            </text>

            {/* Highlight / Danger badge */}
            <rect x={inputX - 110} y={cy + CONCLUSION_H / 2 - 10} width={220} height={32} rx={16}
              fill="#ef4444" fillOpacity={0.1} stroke="#ef4444" strokeWidth={1.5} />
            <text x={inputX} y={cy + CONCLUSION_H / 2 + 6} textAnchor="middle" fill="#ef4444" fontSize={12} fontWeight={800} dominantBaseline="middle">
              {data.conclusion.highlight}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
