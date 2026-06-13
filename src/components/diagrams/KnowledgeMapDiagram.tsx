'use client';

import { KnowledgeMapData } from '@/types';

const TOPIC_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const CENTER_R = 44;
const TOPIC_R = 34;
const SUB_R = 22;
const ORBIT_RADIUS = 150;
const SUB_ORBIT = 70;

export function KnowledgeMapDiagram({ data }: { data: KnowledgeMapData }) {
  const topics = data.topics;
  const svgSize = 580;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  // Distribute topics evenly around center
  const topicPositions = topics.map((topic, i) => {
    const angle = (2 * Math.PI * i) / topics.length - Math.PI / 2;
    const tx = cx + ORBIT_RADIUS * Math.cos(angle);
    const ty = cy + ORBIT_RADIUS * Math.sin(angle);
    const color = TOPIC_COLORS[i % TOPIC_COLORS.length];

    // Distribute children around the topic
    const children = (topic.children || []).map((child, j) => {
      const childAngle = angle + ((j - (topic.children!.length - 1) / 2) * 0.6);
      const sx = tx + SUB_ORBIT * Math.cos(childAngle);
      const sy = ty + SUB_ORBIT * Math.sin(childAngle);
      return { label: child, x: sx, y: sy, color };
    });

    return { label: topic.label, x: tx, y: ty, color, children, angle };
  });

  return (
    <svg viewBox={`0 0 ${svgSize} ${svgSize}`} fill="none" className="w-full" style={{ maxHeight: 580 }}>
      <defs>
        <filter id="km-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity={0.08} />
        </filter>
        <radialGradient id="km-center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx={cx} cy={cy} r={ORBIT_RADIUS + TOPIC_R + 40} fill="url(#km-center-glow)" />

      {/* Connection lines from center to topics */}
      {topicPositions.map((tp, i) => (
        <line key={`line-${i}`} x1={cx} y1={cy} x2={tp.x} y2={tp.y}
          stroke={tp.color} strokeWidth={1.5} strokeOpacity={0.3} />
      ))}

      {/* Connection lines from topics to children */}
      {topicPositions.map((tp, i) =>
        tp.children.map((child, j) => (
          <line key={`child-line-${i}-${j}`} x1={tp.x} y1={tp.y} x2={child.x} y2={child.y}
            stroke={tp.color} strokeWidth={1} strokeOpacity={0.25} />
        ))
      )}

      {/* Child nodes */}
      {topicPositions.map((tp, i) =>
        tp.children.map((child, j) => (
          <g key={`child-${i}-${j}`}>
            <circle cx={child.x} cy={child.y} r={SUB_R}
              fill={tp.color} fillOpacity={0.08}
              stroke={tp.color} strokeWidth={1} />
            <text x={child.x} y={child.y + 1} textAnchor="middle" fill={tp.color} fontSize={8} fontWeight={600} dominantBaseline="middle">
              {child.label.length > 14 ? child.label.slice(0, 13) + '…' : child.label}
            </text>
          </g>
        ))
      )}

      {/* Topic nodes */}
      {topicPositions.map((tp, i) => (
        <g key={`topic-${i}`}>
          <circle cx={tp.x} cy={tp.y} r={TOPIC_R}
            fill={tp.color} fillOpacity={0.1}
            stroke={tp.color} strokeWidth={1.5}
            filter="url(#km-shadow)" />
          <text x={tp.x} y={tp.y + 1} textAnchor="middle" fill={tp.color} fontSize={10} fontWeight={700} dominantBaseline="middle">
            {tp.label.length > 12 ? tp.label.slice(0, 11) + '…' : tp.label}
          </text>
        </g>
      ))}

      {/* Center node */}
      <circle cx={cx} cy={cy} r={CENTER_R}
        fill="#3b82f6" fillOpacity={0.12}
        stroke="#3b82f6" strokeWidth={2}
        filter="url(#km-shadow)" />
      <text x={cx} y={cy + 1} textAnchor="middle" fill="#3b82f6" fontSize={12} fontWeight={800} dominantBaseline="middle">
        {data.center}
      </text>
    </svg>
  );
}
