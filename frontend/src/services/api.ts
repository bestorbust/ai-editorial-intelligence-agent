import type {
  DashboardData,
  StatusData,
  Topic,
  Story,
  Opportunity,
  RefreshResponse,
  HistorySnapshot,
} from "../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Bypass ngrok's browser warning interstitial so fetch receives JSON.
      "ngrok-skip-browser-warning": "true",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (data?.detail) message = data.detail;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return response.json();
}

// -------------------------------------------------------------------
// Opportunity normalization
// Backend returns { id, story_id, headline, score, explanation:{...},
//                   category, keywords[], entities[] }
// UI expects the richer Opportunity shape defined in types/api.ts.
// -------------------------------------------------------------------
function stripHtml(input: string): string {
  if (!input) return "";
  // Remove tags then collapse whitespace
  const text = input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#8217;/gi, "'")
    .replace(/&#8230;/gi, "…")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

interface RawOpportunity {
  id?: number;
  story_id?: number;
  story_idx?: number;
  headline?: string;
  title?: string;
  summary?: string;
  score?: number;
  editorial_score?: number;
  category?: string | null;
  keywords?: string[];
  entities?: string[];
  explanation?: {
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommended_formats?: string[];
    sources?: string[] | Record<string, unknown>;
    scores?: Opportunity["scores"];
    keywords?: string[];
    entities?: string[];
    category?: string | null;
  };
  // pass-through if backend already returns full shape
  rank?: number;
  cluster_id?: number;
  cluster_size?: number;
  generated_at?: string;
  sources?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommended_formats?: string[];
  scores?: Opportunity["scores"];
}

function normalizeOpportunity(
  raw: RawOpportunity,
  index: number
): Opportunity {
  const explanation = raw.explanation ?? {};

  const sourcesRaw = raw.sources ?? explanation.sources ?? [];
  const sources = Array.isArray(sourcesRaw)
    ? sourcesRaw
    : Object.keys(sourcesRaw ?? {});

  const scores =
    raw.scores ??
    explanation.scores ?? {
      trend: 0,
      authority: 0,
      recency: 0,
      source_diversity: 0,
      keyword_strength: 0,
      entity_strength: 0,
    };

  const title =
    raw.headline?.trim() ||
    raw.title?.trim() ||
    "Untitled opportunity";

  const rawSummary =
    typeof raw.summary === "string" && raw.summary.trim()
      ? raw.summary
      : explanation.summary ?? "";

  return {
    rank: raw.rank ?? index + 1,
    cluster_id: raw.cluster_id ?? raw.story_id ?? raw.id ?? index,
    story_idx: raw.story_id ?? raw.story_idx ?? null,
    title,
    summary: stripHtml(rawSummary),
    editorial_score: raw.editorial_score ?? raw.score ?? 0,
    scores,
    keywords: raw.keywords ?? explanation.keywords ?? [],
    entities: raw.entities ?? explanation.entities ?? [],
    sources,
    strengths: raw.strengths ?? explanation.strengths ?? [],
    weaknesses: raw.weaknesses ?? explanation.weaknesses ?? [],
    recommended_formats:
      raw.recommended_formats ?? explanation.recommended_formats ?? [],
    cluster_size: raw.cluster_size ?? 0,
    category: raw.category ?? explanation.category ?? null,
    generated_at: raw.generated_at ?? "",
  };
}

export const intelligenceApi = {
  getDashboard: (): Promise<DashboardData> => request<DashboardData>("/dashboard"),
  getTopics: (): Promise<Topic[]> => request<Topic[]>("/topics"),
  getStories: async (): Promise<Story[]> => {
    const data = await request<Story[] | Record<string, Story>>("/stories");
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") return Object.values(data);
    return [];
  },
  getOpportunities: async (): Promise<Opportunity[]> => {
    const data = await request<RawOpportunity[]>("/opportunities");
    if (!Array.isArray(data)) return [];
    // Sort by score desc so rank reflects editorial priority
    const sorted = [...data].sort(
      (a, b) => (b.score ?? b.editorial_score ?? 0) - (a.score ?? a.editorial_score ?? 0)
    );
    return sorted.map(normalizeOpportunity);
  },
  getStatus: (): Promise<StatusData> => request<StatusData>("/status"),
  refresh: (): Promise<RefreshResponse> =>
    request<RefreshResponse>("/refresh", { method: "POST" }),
  getHistory: (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return request<HistorySnapshot[]>(`/history${query}`);
  },
};

export default intelligenceApi;
