export interface RDKPIs {
  approvedSamples: number;
  testingSamples: number;
  leadTimeDays: number;
  firstPassYield: number;
  monthlyBudgetBillion: number;
}

export interface RDSampleItem {
  code: string;
  name: string;
  status: "approved" | "testing" | "pending" | "designing";
  statusLabel: string;
  department: string;
  createdAt: string;
  dueDate: string;
  progress: number;
}

export interface RDChartTrendPoint {
  month: string;
  approved: number;
  testing: number;
  designing: number;
}
