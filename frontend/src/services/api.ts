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

export const intelligenceApi = {
  getDashboard: (): Promise<DashboardData> => request<DashboardData>("/dashboard"),
  getTopics: (): Promise<Topic[]> => request<Topic[]>("/topics"),
  getStories: (): Promise<Story[]> => request<Story[]>("/stories"),
  getOpportunities: (): Promise<Opportunity[]> => request<Opportunity[]>("/opportunities"),
  getStatus: (): Promise<StatusData> => request<StatusData>("/status"),
  refresh: (): Promise<RefreshResponse> =>
    request<RefreshResponse>("/refresh", { method: "POST" }),
  getHistory: (date?: string) => {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";

  return request<HistorySnapshot[]>(`/history${query}`);
},
};

export default intelligenceApi;
