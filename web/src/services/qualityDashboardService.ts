import { Factory, QualityKPIs, ParetoErrorItem, IncidentItem } from "../modules/quality/types";

export interface QualityMetricItem {
  val: string;
  trend: string;
  sub: string;
  badgeColor?: string;
}

export interface FactorySummaryItem {
  id: string;
  code: string;
  name: string;
  location?: string;
  status: "live" | "planned" | "offline";
  totalLines: number;
  oee: number;
  openIncidents: number;
  mttrMinutes: number;
  portalUrl: string;
  detailsNote?: string;
}

export interface QualityDashboardResponse {
  success: boolean;
  source: "live_htph_clsk" | "local_d1_fallback" | "cached";
  factoryId: string;
  timestamp: string;
  message?: string;
  chainMetrics: {
    firstPassYield: QualityMetricItem;
    oee: QualityMetricItem;
    sla2HoursRate: QualityMetricItem;
    totalOpenIncidents: QualityMetricItem;
  };
  factories: FactorySummaryItem[];
  kg1Kpis?: QualityKPIs;
  paretoErrors?: ParetoErrorItem[];
  incidents?: IncidentItem[];
  error?: string;
}

// Memory Cache (2 minutes TTL)
let memoryCache: { key: string; data: QualityDashboardResponse; timestamp: number } | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000;

export async function fetchQualitySummary(
  factoryId: string = "all",
  forceRefresh: boolean = false
): Promise<QualityDashboardResponse> {
  const cacheKey = `qc_summary_${factoryId}`;
  const now = Date.now();

  if (!forceRefresh && memoryCache && memoryCache.key === cacheKey && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return { ...memoryCache.data, source: "cached" };
  }

  try {
    const res = await fetch(`/api/work/qc-dashboard?factory=${encodeURIComponent(factoryId)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cache-Control": forceRefresh ? "no-cache" : "default",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: không thể lấy dữ liệu chất lượng HTPH-CLSK`);
    }

    const data: QualityDashboardResponse = await res.json();
    
    if (data.success) {
      memoryCache = { key: cacheKey, data, timestamp: now };
    }

    return data;
  } catch (err: any) {
    console.warn("[qualityDashboardService] Error fetching QC dashboard data:", err);
    throw err;
  }
}
