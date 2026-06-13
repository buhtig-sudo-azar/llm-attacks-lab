'use client';

import { SplitFlowDiagramData, SplitFlowStep } from '@/types';

const NODE_H = 40;
const STEP_GAP = 14;
const BRANCH_GAP = 56;
const HEADER_H = 38;
const INPUT_H = 52;
const CONCLUSION_H = 40;
const SIDE_PAD = 32;
const TOP_PAD = 20;
const NODE_PAD_X = 18;

function measureStepWidth(step: SplitFlowStep): number {
  const labelW = step.label.length * 8 + NODE_PAD_X * 2;
  const detailW = step.detail ? step.detail.length * 6 + NODE_PAD_X * 2 : 0;
  return Math.max(labelW, detailW, 160);
}

export function SplitFlowDiagram({ data }: { data: SplitFlowDiagramData }) {
  const leftW = Math.max(data.leftBranch.label.length * 9 + 32, ...data.leftBranch.steps.map(measureStepWidth));
  const rightW = Math.max(data.rightBranch.label.length * 9 + 32, ...data.rightBranch.steps.map(measureStepWidth));
  const inputW = Math.max(data.input.label.length * 9 + 40, 220);

  const svgW = SIDE_PAD + leftW + BRANCH_GAP + rightW + SIDE_PAD;
  const leftCx = SIDE_PAD + leftW / 2;
  const rightCx = SIDE_PAD + leftW + BRANCH_GAP + rightW / 2;
  const inputCx = svgW / 2;

  const splitY = TOP_PAD + INPUT_H + 24;
  const branchStartY = splitY + 20;
  const maxSteps = Math.max(data.leftBranch.steps.length, data.rightBranch.steps.length);
  const branchContentH = maxSteps * (NODE_H + STEP_GAP) - STEP_GAP;
  const branchH = HEADER_H + branchContentH + 12;

  const conclusionY = branchStartY + branchH + 24;
  const svgH = conclusionY + (data.conclusion ? CONCLUSION_H * 3 + 32 : 0) + TOP_PAD;

  function stepY(i: number) {
    return branchStartY + HEADER_H + 6 + i * (NODE_H + STEP_GAP) + NODE_H / 2;
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} fill="none" className="w-full" style={{ maxHeight: 600 }}>
      <defs>
        {/* Shadows */}
        <filter id="sf-input-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.2" />
        </filter>
        <filter id="sf-node-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#000" floodOpacity="0.06" />
        </filter>
        <filter id="sf-header-shadow" x="-5%" y="-10%" width="110%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#000" floodOpacity="0.05" />
        </filter>
        <filter id="sf-danger-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.2" />
        </filter>

        {/* Edge gradients */}
        <linearGradient id="sf-grad-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="sf-grad-right" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Arrow markers */}
        <marker id="sf-arrow-left" viewBox="0 0 10 7" refX={10} refY={3.5} markerWidth={8} markerHeight={6} orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
        <marker id="sf-arrow-right" viewBox="0 0 10 7" refX={10} refY={3.5} markerWidth={8} markerHeight={6} orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
      </defs>

      {/* ─── Input node (dark indigo) ─── */}
      <rect x={inputCx - inputW / 2} y={TOP_PAD} width={inputW} height={INPUT_H} rx={26}
        fill="#1e1b4b" stroke="#6366f1" strokeWidth={2}
        filter="url(#sf-input-shadow)"
      />
      <text x={inputCx} y={TOP_PAD + INPUT_H / 2 - (data.input.url ? 7 : 0)}
        textAnchor="middle" dominantBaseline="middle"
        fill="#e0e7ff" fontSize="14" fontWeight="700">
        {data.input.label}
      </text>
      {data.input.url && (
        <text x={inputCx} y={TOP_PAD + INPUT_H / 2 + 9}
          textAnchor="middle" dominantBaseline="middle"
          fill="#a5b4fc" fontSize="10" fontFamily="monospace">
          {data.input.url}
        </text>
      )}

      {/* ─── Split lines (gradient edges) ─── */}
      <line x1={inputCx} y1={TOP_PAD + INPUT_H} x2={inputCx} y2={splitY} stroke="#6366f1" strokeWidth="2" strokeOpacity="0.5" />
      <line x1={inputCx} y1={splitY} x2={leftCx} y2={splitY} stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.5" />
      <line x1={inputCx} y1={splitY} x2={rightCx} y2={splitY} stroke="#10b981" strokeWidth="2" strokeOpacity="0.5" />
      <line x1={leftCx} y1={splitY} x2={leftCx} y2={branchStartY} stroke="url(#sf-grad-left)" strokeWidth="2" markerEnd="url(#sf-arrow-left)" />
      <line x1={rightCx} y1={splitY} x2={rightCx} y2={branchStartY} stroke="url(#sf-grad-right)" strokeWidth="2" markerEnd="url(#sf-arrow-right)" />

      {/* ─── Left branch ─── */}
      <rect x={SIDE_PAD} y={branchStartY} width={leftW} height={branchH} rx={12}
        fill="#fffbeb" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.25"
      />
      <rect x={SIDE_PAD + 6} y={branchStartY + 6} width={leftW - 12} height={HEADER_H - 12} rx={8}
        fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.5"
        filter="url(#sf-header-shadow)"
      />
      <text x={leftCx} y={branchStartY + HEADER_H / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill="#92400e" fontSize="13" fontWeight="700">
        {data.leftBranch.label}
      </text>

      {/* Left steps */}
      {data.leftBranch.steps.map((step, i) => {
        const sw = measureStepWidth(step);
        const y = stepY(i);
        return (
          <g key={`l-${i}`}>
            {i > 0 && (
              <line x1={leftCx} y1={y - NODE_H / 2 - STEP_GAP} x2={leftCx} y2={y - NODE_H / 2}
                stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
            )}
            <rect x={leftCx - sw / 2} y={y - NODE_H / 2} width={sw} height={NODE_H} rx={8}
              fill="#ffffff" stroke="#fbbf24" strokeWidth="1"
              filter="url(#sf-node-shadow)"
            />
            <text x={leftCx} y={step.detail ? y - 5 : y} textAnchor="middle" dominantBaseline="middle"
              fill="#92400e" fontSize="12" fontWeight="600">
              {step.label}
            </text>
            {step.detail && (
              <text x={leftCx} y={y + 10} textAnchor="middle" dominantBaseline="middle"
                fill="#94a3b8" fontSize="9">
                {step.detail}
              </text>
            )}
          </g>
        );
      })}

      {/* ─── Right branch ─── */}
      <rect x={SIDE_PAD + leftW + BRANCH_GAP} y={branchStartY} width={rightW} height={branchH} rx={12}
        fill="#f0fdf4" fillOpacity="0.4" stroke="#10b981" strokeWidth="1" strokeOpacity="0.25"
      />
      <rect x={SIDE_PAD + leftW + BRANCH_GAP + 6} y={branchStartY + 6} width={rightW - 12} height={HEADER_H - 12} rx={8}
        fill="#f0fdf4" stroke="#10b981" strokeWidth="1.5"
        filter="url(#sf-header-shadow)"
      />
      <text x={rightCx} y={branchStartY + HEADER_H / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill="#166534" fontSize="13" fontWeight="700">
        {data.rightBranch.label}
      </text>

      {/* Right steps */}
      {data.rightBranch.steps.map((step, i) => {
        const sw = measureStepWidth(step);
        const y = stepY(i);
        return (
          <g key={`r-${i}`}>
            {i > 0 && (
              <line x1={rightCx} y1={y - NODE_H / 2 - STEP_GAP} x2={rightCx} y2={y - NODE_H / 2}
                stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
            )}
            <rect x={rightCx - sw / 2} y={y - NODE_H / 2} width={sw} height={NODE_H} rx={8}
              fill="#ffffff" stroke="#4ade80" strokeWidth="1"
              filter="url(#sf-node-shadow)"
            />
            <text x={rightCx} y={step.detail ? y - 5 : y} textAnchor="middle" dominantBaseline="middle"
              fill="#166534" fontSize="12" fontWeight="600">
              {step.label}
            </text>
            {step.detail && (
              <text x={rightCx} y={y + 10} textAnchor="middle" dominantBaseline="middle"
                fill="#94a3b8" fontSize="9">
                {step.detail}
              </text>
            )}
          </g>
        );
      })}

      {/* ─── Conclusion ─── */}
      {data.conclusion && (() => {
        const cy = conclusionY;
        const leftResultW = data.conclusion.left.length * 8 + 32;
        const rightResultW = data.conclusion.right.length * 8 + 32;

        return (
          <g>
            {/* Lines from branches */}
            <path d={`M${leftCx},${branchStartY + branchH} L${leftCx},${cy + CONCLUSION_H / 2}`}
              stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" />
            <path d={`M${rightCx},${branchStartY + branchH} L${rightCx},${cy + CONCLUSION_H / 2}`}
              stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.4" />

            {/* Left result */}
            <rect x={leftCx - leftResultW / 2} y={cy} width={leftResultW} height={CONCLUSION_H} rx={8}
              fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.5"
              filter="url(#sf-node-shadow)"
            />
            <text x={leftCx} y={cy + CONCLUSION_H / 2} textAnchor="middle" dominantBaseline="middle"
              fill="#92400e" fontSize="12" fontWeight="600">
              {data.conclusion.left}
            </text>

            {/* Right result */}
            <rect x={rightCx - rightResultW / 2} y={cy} width={rightResultW} height={CONCLUSION_H} rx={8}
              fill="#f0fdf4" stroke="#10b981" strokeWidth="1.5"
              filter="url(#sf-node-shadow)"
            />
            <text x={rightCx} y={cy + CONCLUSION_H / 2} textAnchor="middle" dominantBaseline="middle"
              fill="#166534" fontSize="12" fontWeight="600">
              {data.conclusion.right}
            </text>

            {/* Danger highlight */}
            {data.conclusion.highlight && (() => {
              const hlW = data.conclusion.highlight.length * 9 + 40;
              const hlY = cy + CONCLUSION_H + 16;
              return (
                <g>
                  <line x1={leftCx} y1={cy + CONCLUSION_H} x2={leftCx} y2={hlY + CONCLUSION_H / 2}
                    stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
                  <line x1={rightCx} y1={cy + CONCLUSION_H} x2={rightCx} y2={hlY + CONCLUSION_H / 2}
                    stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
                  <rect x={inputCx - hlW / 2} y={hlY} width={hlW} height={CONCLUSION_H} rx={20}
                    fill="#fef2f2" stroke="#ef4444" strokeWidth={2}
                    filter="url(#sf-danger-shadow)"
                  />
                  <text x={inputCx} y={hlY + CONCLUSION_H / 2} textAnchor="middle" dominantBaseline="middle"
                    fill="#991b1b" fontSize="13" fontWeight="700">
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
