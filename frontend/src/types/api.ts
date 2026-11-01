export interface DashboardData {
  snapshot: number | null;
  last_updated: string | null;
  raw_articles: number;
  semantic_unique: number;
  stories: number;
  opportunities: number;
  refreshing: boolean;
}

export interface StatusData {
  refreshing: boolean;
  last_updated: string | null;
  snapshot: number | null;
}

export interface Topic {
  id?: number;

  title: string;
  summary?: string | null;

  source: string;
  source_url: string;

  category?: string | null;
  language?: string;
  country?: string | null;

  keywords?: string[];
  entities?: string[];

  trend_score?: number;
  confidence_score?: number;

  raw_text?: string | null;
  status?: string;

  discovered_at?: string;
  updated_at?: string;
}

export interface Story {
  id?: number;
  snapshot_id?: number;

  cluster_id?: number;

  title: string;
  summary?: string | null;

  keywords?: string[];
  category?: string | null;

  editorial_score?: number;
  topic_count?: number;

  representative?: Topic | null;
  topics?: Topic[];
  probabilities?: number[];
}

export interface OpportunityScores {
  trend: number;
  authority: number;
  recency: number;
  source_diversity: number;
  keyword_strength: number;
  entity_strength: number;
}

export interface Opportunity {
  rank: number;

  cluster_id: number;

  story_idx: number | null;

  title: string;

  summary: string;

  editorial_score: number;

  scores: OpportunityScores;

  keywords: string[];

  entities: string[];

  sources: string[];

  strengths: string[];

  weaknesses: string[];

  recommended_formats: string[];

  cluster_size: number;

  category?: string | null;

  generated_at: string;
}

export interface RefreshResponse {
  status: "success" | "already_running";
  snapshot_id?: number;
}

export interface HistorySnapshot {
  id: number;
  created_at: string;

  raw_collected: number;
  semantic_unique: number;

  stories: number;
  opportunities: number;

  pipeline_time: number;
}
