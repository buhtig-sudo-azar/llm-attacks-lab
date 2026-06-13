'use client';

import { KnowledgeMapData } from '@/types';

const TOPIC_COLORS = [
  { fill: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8' },   // blue
  { fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e' },   // amber
  { fill: '#f0fdf4', stroke: '#22c55e', text: '#166534' },   // green
  { fill: '#faf5ff', stroke: '#a855f7', text: '#6b21a8' },   // purple
  { fill: '#fef2f2', stroke: '#ef4444', text: '#991b1b' },   // red
  { fill: '#ecfeff', stroke: '#06b6d4', text: '#155e75' },   // cyan
  { fill: '#fdf2f8', stroke: '#ec4899', text: '#9d174d' },   // pink
  { fill: '#f7fee7', stroke: '#84cc16', text: '#3f6212' },   // lime
];

const ORBIT_R = 170;
const SUB_ORBIT_R = 80;
const CENTER_R = 48;
const TOPIC_R = 36;
const SUB_R = 24;

export function KnowledgeMapDiagram({ data }: { data: KnowledgeMapData }) {
  const svgSize = 620;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const topics = data.topics;

  const topicPositions = topics.map((topic, i) => {
    const angle = (2 * Math.PI * i) / topics.length - Math.PI / 2;
    const tx = cx + ORBIT_R * Math.cos(angle);
    const ty = cy + ORBIT_R * Math.sin(angle);
    const color = TOPIC_COLORS[i % TOPIC_COLORS.length];

    const childCount = (topic.children || []).length;
    const children = (topic.children || []).map((child, j) => {
      const spreadAngle = childCount <= 1 ? 0 : (j - (childCount - 1) / 2) * 0.45;
      const childAngle = angle + spreadAngle;
      const sx = tx + SUB_ORBIT_R * Math.cos(childAngle);
      const sy = ty + SUB_ORBIT_R * Math.sin(childAngle);
      return { label: child, x: sx, y: sy, color };
    });

    return { label: topic.label, x: tx, y: ty, color, children, angle };
  });

  return (
    <svg viewBox={`0 0 ${svgSize} ${svgSize}`} fill="none" className="w-full" style={{ maxHeight: 620 }}>
      <defs>
        {/* Center gradient */}
        <linearGradient id="km-center-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Glow filter for center */}
        <filter id="km-center-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feFlood floodColor="#6366f1" floodOpacity="0.2" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Node shadow */}
        <filter id="km-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
        </filter>

        {/* Sub-node shadow */}
        <filter id="km-sub-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.06" />
        </filter>

        {/* Orbit ring gradient */}
        <radialGradient id="km-ring-glow" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
        </radialGradient>

        {/* Per-topic gradients */}
        {TOPIC_COLORS.map((c, i) => (
          <linearGradient key={i} id={`km-topic-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.fill} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
          </linearGradient>
        ))}
      </defs>

      {/* Background glow */}
      <circle cx={cx} cy={cy} r={ORBIT_R + TOPIC_R + 50} fill="url(#km-ring-glow)" />

      {/* Orbit ring */}
      <circle cx={cx} cy={cy} r={ORBIT_R} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 6" fill="none" opacity="0.5" />

      {/* Connection lines: center → topics */}
      {topicPositions.map((tp, i) => (
        <line key={`cl-${i}`} x1={cx} y1={cy} x2={tp.x} y2={tp.y}
          stroke={tp.color.stroke} strokeWidth="1.5" strokeOpacity="0.25" />
      ))}

      {/* Connection lines: topics → children */}
      {topicPositions.map((tp, i) =>
        tp.children.map((child, j) => (
          <line key={`tl-${i}-${j}`} x1={tp.x} y1={tp.y} x2={child.x} y2={child.y}
            stroke={tp.color.stroke} strokeWidth="1" strokeOpacity="0.2" />
        ))
      )}

      {/* Child nodes */}
      {topicPositions.map((tp, i) =>
        tp.children.map((child, j) => (
          <g key={`cn-${i}-${j}`}>
            <circle cx={child.x} cy={child.y} r={SUB_R}
              fill="#ffffff" stroke={tp.color.stroke} strokeWidth="1"
              filter="url(#km-sub-shadow)"
            />
            <text x={child.x} y={child.y + 1} textAnchor="middle" dominantBaseline="middle"
              fill={tp.color.text} fontSize="8" fontWeight="600">
              {child.label.length > 12 ? child.label.slice(0, 11) + '…' : child.label}
            </text>
          </g>
        ))
      )}

      {/* Topic nodes */}
      {topicPositions.map((tp, i) => (
        <g key={`tn-${i}`}>
          <circle cx={tp.x} cy={tp.y} r={TOPIC_R}
            fill={tp.color.fill} stroke={tp.color.stroke} strokeWidth="1.5"
            filter="url(#km-node-shadow)"
          />
          <text x={tp.x} y={tp.y + 1} textAnchor="middle" dominantBaseline="middle"
            fill={tp.color.text} fontSize="10" fontWeight="700">
            {tp.label.length > 10 ? tp.label.slice(0, 9) + '…' : tp.label}
          </text>
        </g>
      ))}

      {/* Center node */}
      <circle cx={cx} cy={cy} r={CENTER_R}
        fill="url(#km-center-grad)" stroke="#a5b4fc" strokeWidth="2"
        filter="url(#km-center-glow)"
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill="#ffffff" fontSize="13" fontWeight="800">
        {data.center}
      </text>
    </svg>
  );
}
