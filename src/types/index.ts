export interface SubtopicIntroduction {
  what: string;
  why: string;
  where: string;
  problem: string;
}

export interface Term {
  term: string;
  definition: string;
}

export interface SubtopicTheory {
  terms: Term[];
  principles: string;
  architecture: string;
  connections: string;
}

/* ─── Diagram Types ─── */

export type DiagramNodeRole = 'input' | 'process' | 'decision' | 'output' | 'danger' | 'success' | 'warning' | 'neutral';

// Split Flow — canonical WCD diagram showing cache vs origin divergence
export interface SplitFlowStep {
  label: string;
  detail?: string;
  role: DiagramNodeRole;
}

export interface SplitFlowBranch {
  label: string;
  subtitle?: string;
  steps: SplitFlowStep[];
}

export interface SplitFlowDiagramData {
  type: 'split-flow';
  title: string;
  input: { label: string; subtitle?: string; url?: string };
  leftBranch: SplitFlowBranch;
  rightBranch: SplitFlowBranch;
  conclusion?: { left: string; right: string; highlight: string };
}

// Processing Flow — sequential flow with decisions
export interface ProcessingFlowStep {
  label: string;
  detail?: string;
  role: DiagramNodeRole;
  branchLabel?: string;
}

export interface ProcessingFlowDiagramData {
  type: 'processing-flow';
  title: string;
  steps: ProcessingFlowStep[];
}

// Dependency Graph — hierarchical tree
export interface DependencyNode {
  label: string;
  detail?: string;
  children?: DependencyNode[];
}

export interface DependencyGraphData {
  type: 'dependency-graph';
  title: string;
  root: DependencyNode;
}

// Cause → Effect chain
export interface CauseEffectStep {
  label: string;
  detail?: string;
  role: 'cause' | 'effect' | 'danger';
}

export interface CauseEffectData {
  type: 'cause-effect';
  title: string;
  steps: CauseEffectStep[];
}

// Attack Tree
export interface AttackTreeBranch {
  label: string;
  items: string[];
}

export interface AttackTreeData {
  type: 'attack-tree';
  title: string;
  root: string;
  branches: AttackTreeBranch[];
}

// Knowledge Map — interconnected topics
export interface KnowledgeMapTopic {
  label: string;
  children?: string[];
}

export interface KnowledgeMapData {
  type: 'knowledge-map';
  title: string;
  center: string;
  topics: KnowledgeMapTopic[];
}

// Union type for all diagrams
export type DiagramData =
  | SplitFlowDiagramData
  | ProcessingFlowDiagramData
  | DependencyGraphData
  | CauseEffectData
  | AttackTreeData
  | KnowledgeMapData;

/* ─── End Diagram Types ─── */

export interface PracticalExample {
  title: string;
  description: string;
  code?: string;
  language?: string;
}

export type SandboxType =
  | 'cache-flow-sim' | 'cache-key-lab' | 'delimiter-lab' | 'path-mapping-lab'
  | 'normalization-lab' | 'static-rule-lab' | 'attack-builder' | 'cache-defense-lab'
  | 'header-inspector' | 'url-parser' | 'encoding-lab' | 'request-flow-lab';

export interface Sandbox {
  type: SandboxType;
  title: string;
  description: string;
  defaultPrompt?: string;
  defaultSystem?: string;
  defaultTemperature?: number;
  placeholder?: string;
}

export interface CommonMistake {
  mistake: string;
  explanation: string;
  correctApproach: string;
}

export interface FurtherReading {
  topic: string;
  slug: string;
  categorySlug: string;
}

export interface Subtopic {
  slug: string;
  title: string;
  categorySlug: string;
  introduction: SubtopicIntroduction;
  theory: SubtopicTheory;
  diagram: DiagramData;
  practicalExamples: PracticalExample[];
  sandboxes?: Sandbox[];
  commonMistakes: CommonMistake[];
  furtherReading: FurtherReading[];
}

export interface TopicCategory {
  slug: string;
  title: string;
  description: string;
  iconName: string;
  subtopics: Subtopic[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SearchItem {
  type: 'category' | 'subtopic' | 'term';
  title: string;
  description: string;
  categorySlug: string;
  subtopicSlug?: string;
  keywords: string[];
}

export interface AgentData {
  slug: string;
  name: string;
  role: string;
  avatar: string;
  gradient: string;
  greeting: string;
  suggestions: string[];
}

export interface GamificationState {
  xp: number;
  level: number;
  achievements: Achievement[];
  streak: number;
  lastActiveDate: string | null;
  dailyQuests: DailyQuest[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  xpReward: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
}
