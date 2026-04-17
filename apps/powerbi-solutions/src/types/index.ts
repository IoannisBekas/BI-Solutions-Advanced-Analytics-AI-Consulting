export interface TMDLModel {
  name: string;
  tables: TMDLTable[];
  relationships: TMDLRelationship[];
  measures: TMDLMeasure[];
}

export interface TMDLTable {
  name: string;
  columns: TMDLColumn[];
  partitions?: TMDLPartition[];
}

export interface TMDLColumn {
  name: string;
  dataType: string;
  isHidden?: boolean;
  expression?: string;
}

export interface TMDLPartition {
  name: string;
  mode: string;
  source?: string;
}

export interface TMDLRelationship {
  name: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: string;
}

export interface TMDLMeasure {
  name: string;
  table: string;
  expression: string;
  formatString?: string;
  displayFolder?: string;
}

export interface Recommendation {
  id: string;
  type: 'performance' | 'best-practice' | 'optimization' | 'warning';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedItems?: string[];
  suggestion?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AnalysisResult {
  model: TMDLModel | null;
  recommendations: Recommendation[];
  summary: {
    tableCount: number;
    columnCount: number;
    measureCount: number;
    relationshipCount: number;
  };
}

export type AnimationDirection = 'up' | 'left' | 'right' | 'scale';

// Dashboard Visual Review types
export type ImageMediaType = 'image/png' | 'image/jpeg' | 'image/webp';

export interface DashboardImage {
  id: string;
  file: File;
  base64: string;
  mediaType: ImageMediaType;
  previewUrl: string;
}

export type VisualRecommendationType =
  | 'layout'
  | 'color-contrast'
  | 'readability'
  | 'chart-choice'
  | 'accessibility'
  | 'branding'
  | 'mobile';

export interface VisualRecommendation {
  id: string;
  type: VisualRecommendationType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  screenshotIndex?: number;
  suggestion?: string;
}

export interface DashboardReviewResult {
  recommendations: VisualRecommendation[];
  overallScore?: number;
  summary: string;
}
