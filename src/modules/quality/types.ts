export interface Factory {
  id: string;
  code: string;
  name: string;
  location?: string;
  status: "live" | "planned" | "offline";
  portalUrl?: string;
  apiEndpoint?: string;
  enabled: boolean;
  workshops?: {
    name: string;
    linesCount: number;
  }[];
  totalLines?: number;
  oee?: number;
  openIncidents?: number;
  mttrMinutes?: number;
}

export interface QualityKPIs {
  unprocessed: number;
  processing: number;
  trialRun: number;
  completed: number;
  emergencySOS: number;
}

export interface ParetoErrorItem {
  id: string;
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface IncidentItem {
  id: string;
  code: string;
  workshop: string;
  line: string;
  team: string;
  errorType: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "unprocessed" | "processing" | "trial" | "completed";
  slaRemaining?: string;
  slaPercent?: number;
  mttrMinutes?: number;
  createdAt: string;
  reporter: string;
}
