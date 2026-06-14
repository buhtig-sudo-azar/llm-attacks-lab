'use client';

import { DiagramData } from '@/types';
import { SplitFlowDiagram } from './SplitFlowDiagram';
import { ProcessingFlowDiagram } from './ProcessingFlowDiagram';
import { DependencyGraphDiagram } from './DependencyGraphDiagram';
import { CauseEffectDiagram } from './CauseEffectDiagram';
import { AttackTreeDiagram } from './AttackTreeDiagram';
import { KnowledgeMapDiagram } from './KnowledgeMapDiagram';

export function DiagramRenderer({ data }: { data: DiagramData }) {
  return (
    <div className="w-full">
      {data.type === 'split-flow' && <SplitFlowDiagram data={data} />}
      {data.type === 'processing-flow' && <ProcessingFlowDiagram data={data} />}
      {data.type === 'dependency-graph' && <DependencyGraphDiagram data={data} />}
      {data.type === 'cause-effect' && <CauseEffectDiagram data={data} />}
      {data.type === 'attack-tree' && <AttackTreeDiagram data={data} />}
      {data.type === 'knowledge-map' && <KnowledgeMapDiagram data={data} />}
    </div>
  );
}
