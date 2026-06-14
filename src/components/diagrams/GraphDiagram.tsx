'use client';

import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';

/* ─── Public types ─── */

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  symbol: string;
  color: string;
  role: string;
  description: string;
  radius?: number;
}

export interface GraphLink {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
  color?: string;
}

export interface GraphLegend {
  color: string;
  label: string;
}

export interface GraphDiagramProps {
  nodes: GraphNode[];
  links: GraphLink[];
  legend: GraphLegend[];
  viewBox: { x: number; y: number; w: number; h: number };
  hint?: string;
}

/* ─── Theme-aware palette ─── */

function palette(resolved: string | undefined) {
  const dark = resolved === 'dark';
  return {
    grid: dark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.04)',
    linkBase: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
    labelFill: dark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.65)',
    linkLabel: dark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.38)',
    panelBg: dark ? 'rgba(30,30,40,0.85)' : 'rgba(255,255,255,0.92)',
    panelBorder: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
    panelText: dark ? '#e2e8f0' : '#334155',
    panelMuted: dark ? '#94a3b8' : '#64748b',
    hintFill: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)',
    nodeFillBase: dark ? 0.18 : 0.15,
    nodeFillHover: dark ? 0.35 : 0.30,
    nodeStrokeHover: dark ? 2.5 : 2.2,
  };
}

/* ─── Component ─── */

export function GraphDiagram({ nodes, links, legend, viewBox, hint }: GraphDiagramProps) {
  const { resolvedTheme } = useTheme();
  const p = palette(resolvedTheme);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selectedNode = nodes.find(n => n.id === selectedId) ?? null;

  const connectedTo = useCallback(
    (nodeId: string) => {
      if (hoveredId !== nodeId) return false;
      return true;
    },
    [hoveredId],
  );

  const isLinkHighlighted = (link: GraphLink) =>
    hoveredId === link.from || hoveredId === link.to;

  /* helpers */
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  /* shorten edge so it doesn't overlap circles */
  function shortenEdge(from: GraphNode, to: GraphNode) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
    const rFrom = from.radius ?? 24;
    const rTo = to.radius ?? 24;
    const ux = dx / dist;
    const uy = dy / dist;
    return {
      x1: from.x + ux * rFrom,
      y1: from.y + uy * rFrom,
      x2: to.x - ux * rTo,
      y2: to.y - uy * rTo,
    };
  }

  /* Compute safe viewBox with padding for labels */
  const LABEL_PAD = 28; // extra space below nodes for labels
  const EDGE_PAD = 20;  // extra space on sides for text that extends beyond node
  const safeViewBox = {
    x: viewBox.x - EDGE_PAD,
    y: viewBox.y - EDGE_PAD,
    w: viewBox.w + EDGE_PAD * 2,
    h: viewBox.h + LABEL_PAD + EDGE_PAD,
  };

  return (
    <div>
      {/* Instruction hint */}
      <p className="text-xs mb-2 flex items-center gap-1.5" style={{ color: p.hintFill }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        {hint ?? 'Нажмите на элемент для подробного описания'}
      </p>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`${safeViewBox.x} ${safeViewBox.y} ${safeViewBox.w} ${safeViewBox.h}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ maxHeight: 620, minWidth: 320 }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="gd-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={p.grid} strokeWidth="1" />
            </pattern>

            {/* Glow filter */}
            <filter id="gd-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrow marker */}
            <marker id="gd-arrow" viewBox="0 0 10 7" refX={10} refY={3.5} markerWidth={8} markerHeight={6} orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={p.linkBase} />
            </marker>
          </defs>

          {/* Background grid */}
          <rect x={safeViewBox.x} y={safeViewBox.y} width={safeViewBox.w} height={safeViewBox.h} fill="url(#gd-grid)" />

          {/* ─── Links ─── */}
          {links.map((link, i) => {
            const fromNode = nodeMap.get(link.from);
            const toNode = nodeMap.get(link.to);
            if (!fromNode || !toNode) return null;

            const highlighted = isLinkHighlighted(link);
            const edge = shortenEdge(fromNode, toNode);
            const linkColor = highlighted
              ? (link.color ?? fromNode.color)
              : p.linkBase;

            return (
              <g key={`link-${i}`}>
                <line
                  x1={edge.x1} y1={edge.y1}
                  x2={edge.x2} y2={edge.y2}
                  stroke={linkColor}
                  strokeWidth={highlighted ? 2.5 : 1.5}
                  strokeDasharray={link.animated ? '6,4' : undefined}
                  markerEnd={!link.animated ? 'url(#gd-arrow)' : undefined}
                />
                {link.label && (() => {
                  const lx = (fromNode.x + toNode.x) / 2;
                  const ly = (fromNode.y + toNode.y) / 2 - 10;
                  const lFontSize = 10;
                  const lTextWidth = (link.label?.length ?? 0) * lFontSize * 0.55;
                  return (
                    <>
                      <rect
                        x={lx - lTextWidth / 2 - 3}
                        y={ly - lFontSize + 1}
                        width={lTextWidth + 6}
                        height={lFontSize + 4}
                        rx={2}
                        fill={p.panelBg}
                        opacity={0.8}
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        fill={highlighted ? linkColor : p.linkLabel}
                        fontSize={lFontSize}
                        fontWeight={highlighted ? 600 : 400}
                      >
                        {link.label}
                      </text>
                    </>
                  );
                })()}
                {link.animated && (
                  <circle r="3" fill={fromNode.color} filter="url(#gd-glow)">
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path={`M${edge.x1},${edge.y1} L${edge.x2},${edge.y2}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* ─── Nodes ─── */}
          {nodes.map(node => {
            const isSelected = selectedId === node.id;
            const isHovered = hoveredId === node.id;
            const r = node.radius ?? 24;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedId(isSelected ? null : node.id)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer"
              >
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={node.color + (isSelected ? '40' : isHovered ? (resolvedTheme === 'dark' ? '30' : '28') : (resolvedTheme === 'dark' ? '18' : '15'))}
                  stroke={node.color}
                  strokeWidth={isSelected ? 3 : isHovered ? 2.2 : 1.2}
                  filter={isSelected || isHovered ? 'url(#gd-glow)' : undefined}
                />

                {/* Symbol inside node */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={node.color}
                  fontSize={r >= 30 ? 18 : r >= 22 ? 15 : 12}
                  fontWeight={700}
                >
                  {node.symbol}
                </text>

                {/* Label below node — with background rect for readability */}
                {(() => {
                  const labelText = node.label.length > 18 ? node.label.slice(0, 17) + '…' : node.label;
                  const labelY = node.y + r + 16;
                  const labelFontSize = 10;
                  const textWidth = labelText.length * labelFontSize * 0.55;
                  return (
                    <>
                      <rect
                        x={node.x - textWidth / 2 - 4}
                        y={labelY - labelFontSize + 1}
                        width={textWidth + 8}
                        height={labelFontSize + 4}
                        rx={3}
                        fill={p.panelBg}
                        opacity={0.85}
                      />
                      <text
                        x={node.x}
                        y={labelY}
                        textAnchor="middle"
                        fill={p.labelFill}
                        fontSize={labelFontSize}
                        fontWeight={500}
                      >
                        {labelText}
                      </text>
                    </>
                  );
                })()}
              </g>
            );
          })}

          {/* ─── Legend ─── */}
          {legend.length > 0 && (
            <g transform={`translate(${safeViewBox.x + 16}, ${safeViewBox.y + safeViewBox.h - 16})`}>
              <rect
                x={-8}
                y={-14}
                width={legend.length * 120 + 8}
                height={24}
                rx={4}
                fill={p.panelBg}
                opacity={0.8}
              />
              {legend.map((item, i) => (
                <g key={i} transform={`translate(${i * 120}, 0)`}>
                  <circle cx="0" cy="0" r="5" fill={item.color} />
                  <text x="10" y="4" fill={p.labelFill} fontSize="10">{item.label}</text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* ─── Description panel ─── */}
      {selectedNode && (
        <div
          className="mt-3 p-3 rounded-lg border animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
          style={{
            borderColor: p.panelBorder,
            backgroundColor: p.panelBg,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: selectedNode.color }}
            />
            <span className="font-semibold text-sm" style={{ color: p.panelText }}>
              {selectedNode.label}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{ borderColor: selectedNode.color, color: selectedNode.color }}
            >
              {selectedNode.role}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: p.panelMuted }}>
            {selectedNode.description}
          </p>
        </div>
      )}
    </div>
  );
}
