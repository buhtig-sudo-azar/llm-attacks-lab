'use client';

import { SplitFlowDiagramData, SplitFlowStep } from '@/types';

const NODE_PAD_X = 16;
const NODE_PAD_Y = 8;
const NODE_H = 32;
const FONT_SIZE = 12;
const DETAIL_SIZE = 9;
const STEP_GAP = 36;
const BRANCH_GAP = 48;
const HEADER_H = 30;
const SIDE_PAD = 24;
const TOP_PAD = 16;

function measureStepWidth(step: SplitFlowStep): number {
  const labelW = step.label.length * FONT_SIZE * 0.6;
  const detailW = step.detail ? step.detail.length * DETAIL_SIZE * 0.55 : 0;
  return Math.max(labelW, detailW) + NODE_PAD_X * 2;
}

export function SplitFlowDiagram({ data }: { data: SplitFlowDiagramData }) {
  // Measure widths
  const leftW = Math.max(
    data.leftBranch.label.length * FONT_SIZE * 0.6 + NODE_PAD_X * 2,
    ...data.leftBranch.steps.map(measureStepWidth)
  );
  const rightW = Math.max(
    data.rightBranch.label.length * FONT_SIZE * 0.6 + NODE_PAD_X * 2,
    ...data.rightBranch.steps.map(measureStepWidth)
  );

  const inputW = Math.max(
    data.input.label.length * FONT_SIZE * 0.6 + NODE_PAD_X * 2,
    data.input.url ? data.input.url.length * DETAIL_SIZE * 0.55 + NODE_PAD_X * 2 : 0
  );

  const svgW = SIDE_PAD + leftW + BRANCH_GAP + rightW + SIDE_PAD;
  const leftCx = SIDE_PAD + leftW / 2;
  const rightCx = SIDE_PAD + leftW + BRANCH_GAP + rightW / 2;
  const inputCx = svgW / 2;

  // Heights
  const inputH = data.input.url ? NODE_H + 16 : NODE_H + NODE_PAD_Y * 2;
  const maxSteps = Math.max(data.leftBranch.steps.length, data.rightBranch.steps.length);
  const branchH = HEADER_H + 8 + maxSteps * (NODE_H + STEP_GAP) - STEP_GAP + NODE_PAD_Y;

  const svgH = TOP_PAD + inputH + STEP_GAP + branchH + (data.conclusion ? STEP_GAP + NODE_H * 3 + 16 : 0) + TOP_PAD;

  function leftStepY(i: number) {
    return TOP_PAD + inputH + STEP_GAP + HEADER_H + 8 + i * (NODE_H + STEP_GAP) + NODE_H / 2;
  }
  function rightStepY(i: number) {
    return leftStepY(i);
  }

  function StepNode({ step, cx, y }: { step: SplitFlowStep; cx: number; y: number }) {
    const w = measureStepWidth(step);
    const hasDetail = !!step.detail;
    const nh = hasDetail ? NODE_H + 14 : NODE_H;
    return (
      <g>
        <rect
          x={cx - w / 2} y={y - nh / 2}
          width={w} height={nh}
          rx={4}
          fill="transparent"
          stroke="#94a3b8" strokeWidth={1}
        />
        <text
          x={cx} y={hasDetail ? y - 4 : y}
          textAnchor="middle" dominantBaseline="middle"
          fill="#334155" fontSize={FONT_SIZE} fontWeight={500}
        >
          {step.label}
        </text>
        {step.detail && (
          <text x={cx} y={y + 12} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={DETAIL_SIZE}>
            {step.detail}
          </text>
        )}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      {/* Input node */}
      <rect
        x={inputCx - inputW / 2} y={TOP_PAD}
        width={inputW} height={inputH}
        rx={4}
        fill="#3b82f6" fillOpacity={0.06}
        stroke="#3b82f6" strokeWidth={1}
      />
      <text
        x={inputCx} y={TOP_PAD + inputH / 2 - (data.input.url ? 6 : 0)}
        textAnchor="middle" dominantBaseline="middle"
        fill="#3b82f6" fontSize={FONT_SIZE} fontWeight={600}
      >
        {data.input.label}
      </text>
      {data.input.url && (
        <text x={inputCx} y={TOP_PAD + inputH / 2 + 8} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={DETAIL_SIZE} fontFamily="monospace">
          {data.input.url}
        </text>
      )}

      {/* Split lines */}
      <line x1={inputCx} y1={TOP_PAD + inputH} x2={inputCx} y2={TOP_PAD + inputH + STEP_GAP / 2} stroke="#94a3b8" strokeWidth={1} />
      <line x1={leftCx} y1={TOP_PAD + inputH + STEP_GAP / 2} x2={rightCx} y2={TOP_PAD + inputH + STEP_GAP / 2} stroke="#94a3b8" strokeWidth={1} />
      <line x1={leftCx} y1={TOP_PAD + inputH + STEP_GAP / 2} x2={leftCx} y2={TOP_PAD + inputH + STEP_GAP} stroke="#94a3b8" strokeWidth={1} />
      <line x1={rightCx} y1={TOP_PAD + inputH + STEP_GAP / 2} x2={rightCx} y2={TOP_PAD + inputH + STEP_GAP} stroke="#94a3b8" strokeWidth={1} />

      {/* Left branch header */}
      <rect
        x={leftCx - leftW / 2} y={TOP_PAD + inputH + STEP_GAP}
        width={leftW} height={HEADER_H}
        rx={4}
        fill="#f59e0b" fillOpacity={0.06}
        stroke="#f59e0b" strokeWidth={1}
      />
      <text x={leftCx} y={TOP_PAD + inputH + STEP_GAP + HEADER_H / 2} textAnchor="middle" dominantBaseline="middle" fill="#f59e0b" fontSize={FONT_SIZE} fontWeight={600}>
        {data.leftBranch.label}
      </text>
      {data.leftBranch.subtitle && (
        <text x={leftCx} y={TOP_PAD + inputH + STEP_GAP + HEADER_H / 2 + 12} textAnchor="middle" fill="#94a3b8" fontSize={DETAIL_SIZE}>
          {data.leftBranch.subtitle}
        </text>
      )}

      {/* Right branch header */}
      <rect
        x={rightCx - rightW / 2} y={TOP_PAD + inputH + STEP_GAP}
        width={rightW} height={HEADER_H}
        rx={4}
        fill="#10b981" fillOpacity={0.06}
        stroke="#10b981" strokeWidth={1}
      />
      <text x={rightCx} y={TOP_PAD + inputH + STEP_GAP + HEADER_H / 2} textAnchor="middle" dominantBaseline="middle" fill="#10b981" fontSize={FONT_SIZE} fontWeight={600}>
        {data.rightBranch.label}
      </text>
      {data.rightBranch.subtitle && (
        <text x={rightCx} y={TOP_PAD + inputH + STEP_GAP + HEADER_H / 2 + 12} textAnchor="middle" fill="#94a3b8" fontSize={DETAIL_SIZE}>
          {data.rightBranch.subtitle}
        </text>
      )}

      {/* Left steps */}
      {data.leftBranch.steps.map((step, i) => (
        <g key={i}>
          <line x1={leftCx} y1={leftStepY(i) - NODE_H / 2 - STEP_GAP / 2} x2={leftCx} y2={leftStepY(i) - NODE_H / 2} stroke="#94a3b8" strokeWidth={1} />
          <StepNode step={step} cx={leftCx} y={leftStepY(i)} />
        </g>
      ))}

      {/* Right steps */}
      {data.rightBranch.steps.map((step, i) => (
        <g key={i}>
          <line x1={rightCx} y1={rightStepY(i) - NODE_H / 2 - STEP_GAP / 2} x2={rightCx} y2={rightStepY(i) - NODE_H / 2} stroke="#94a3b8" strokeWidth={1} />
          <StepNode step={step} cx={rightCx} y={rightStepY(i)} />
        </g>
      ))}

      {/* Conclusion */}
      {data.conclusion && (() => {
        const concY = TOP_PAD + inputH + STEP_GAP + branchH + STEP_GAP;
        const leftResultW = data.conclusion.left.length * FONT_SIZE * 0.6 + NODE_PAD_X * 2;
        const rightResultW = data.conclusion.right.length * FONT_SIZE * 0.6 + NODE_PAD_X * 2;

        return (
          <g>
            {/* Lines from branches */}
            <line x1={leftCx} y1={TOP_PAD + inputH + STEP_GAP + branchH} x2={leftCx} y2={concY + NODE_H / 2} stroke="#f59e0b" strokeWidth={1} strokeOpacity={0.5} />
            <line x1={rightCx} y1={TOP_PAD + inputH + STEP_GAP + branchH} x2={rightCx} y2={concY + NODE_H / 2} stroke="#10b981" strokeWidth={1} strokeOpacity={0.5} />

            {/* Left result */}
            <rect x={leftCx - leftResultW / 2} y={concY} width={leftResultW} height={NODE_H} rx={4}
              fill="#f59e0b" fillOpacity={0.06} stroke="#f59e0b" strokeWidth={1} />
            <text x={leftCx} y={concY + NODE_H / 2} textAnchor="middle" dominantBaseline="middle" fill="#f59e0b" fontSize={FONT_SIZE} fontWeight={600}>
              {data.conclusion.left}
            </text>

            {/* Right result */}
            <rect x={rightCx - rightResultW / 2} y={concY} width={rightResultW} height={NODE_H} rx={4}
              fill="#10b981" fillOpacity={0.06} stroke="#10b981" strokeWidth={1} />
            <text x={rightCx} y={concY + NODE_H / 2} textAnchor="middle" dominantBaseline="middle" fill="#10b981" fontSize={FONT_SIZE} fontWeight={600}>
              {data.conclusion.right}
            </text>

            {/* Highlight */}
            <line x1={leftCx} y1={concY + NODE_H} x2={leftCx} y2={concY + NODE_H + STEP_GAP / 2} stroke="#94a3b8" strokeWidth={1} />
            <line x1={rightCx} y1={concY + NODE_H} x2={rightCx} y2={concY + NODE_H + STEP_GAP / 2} stroke="#94a3b8" strokeWidth={1} />
            <line x1={leftCx} y1={concY + NODE_H + STEP_GAP / 2} x2={rightCx} y2={concY + NODE_H + STEP_GAP / 2} stroke="#94a3b8" strokeWidth={1} />
            <line x1={inputCx} y1={concY + NODE_H + STEP_GAP / 2} x2={inputCx} y2={concY + NODE_H + STEP_GAP} stroke="#94a3b8" strokeWidth={1} />

            {data.conclusion.highlight && (() => {
              const hlW = data.conclusion.highlight.length * FONT_SIZE * 0.6 + NODE_PAD_X * 2;
              const hlY = concY + NODE_H + STEP_GAP;
              return (
                <g>
                  <rect x={inputCx - hlW / 2} y={hlY} width={hlW} height={NODE_H} rx={4}
                    fill="#ef4444" fillOpacity={0.06} stroke="#ef4444" strokeWidth={1} />
                  <text x={inputCx} y={hlY + NODE_H / 2} textAnchor="middle" dominantBaseline="middle" fill="#ef4444" fontSize={FONT_SIZE} fontWeight={700}>
                    {data.conclusion.highlight}
                  </text>
                </g>
              );
            })()}
          </g>
        );
      })()}
    </svg>
  );
}
