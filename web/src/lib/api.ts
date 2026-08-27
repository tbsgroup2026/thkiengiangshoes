// API client for TBS recruitment. All calls go to the Express backend.
// In dev: http://localhost:8000 (or NEXT_PUBLIC_API_URL)
// In production: same origin proxied through Cloudflare Workers

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================
// TYPES
// ============================================================
export interface Job {
  id: string;
  title: string;
  salary: string;
  location: string;
  description: string;
  requirements: string;
  benefits?: string;
  slots: number;
  category?: string;
  educationLevel?: string;
  expiresAt?: string;
  viewCount: number;
  applyCount: number;
  contactEmail: string;
  contactPhone: string;
  status: string;
  province?: string;
  department?: { name: string; code: string };
  _count?: { applications: number };
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  cvUrl: string;
  status: string;
  createdAt: string;
  job?: { title: string; location: string; salary: string; contactEmail: string; contactPhone: string };
  interview?: InterviewSchedule;
}

export interface InterviewSchedule {
  id: string;
  scheduledAt: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: string;
}

export interface InterviewSlot {
  datetime: string;
  date: string;
  time: string;
  dayOfWeek: number;
  available: boolean;
  remaining: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ============================================================
// JOBS
// ============================================================
export async function fetchJobs(params?: {
  search?: string;
  category?: string;
  province?: string;
  status?: string;
}): Promise<Job[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.province) searchParams.set("province", params.province);
  if (params?.status) searchParams.set("status", params.status);

  const qs = searchParams.toString();
  const url = `${API_BASE}/api/recruitment/jobs${qs ? `?${qs}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function fetchJob(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/recruitment/jobs/${id}`);
  if (!res.ok) throw new Error("Job not found");
  return res.json();
}

// ============================================================
// CV UPLOAD
// ============================================================
export async function uploadCV(file: File): Promise<{ cvUrl: string; fileName: string; fileSize: number }> {
  const formData = new FormData();
  formData.append("cv", file);

  const res = await fetch(`${API_BASE}/api/recruitment/upload-cv`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }

  return res.json();
}

// ============================================================
// APPLY
// ============================================================
export async function applyToJob(
  jobId: string,
  data: {
    fullName: string;
    email: string;
    phone: string;
    coverLetter?: string;
    cvUrl: string;
  }
): Promise<{ success: boolean; application: JobApplication; message: string }> {
  const res = await fetch(`${API_BASE}/api/recruitment/jobs/${jobId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Application failed");
  }

  return res.json();
}

// ============================================================
// APPLICATION TRACKING
// ============================================================
export async function trackApplication(
  applicationId: string,
  email: string
): Promise<JobApplication> {
  const res = await fetch(
    `${API_BASE}/api/recruitment/applications/${applicationId}?email=${encodeURIComponent(email)}`
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Application not found");
  }

  return res.json();
}

// ============================================================
// INTERVIEW SLOTS
// ============================================================
export async function fetchInterviewSlots(
  startDate?: string,
  endDate?: string
): Promise<{ slots: InterviewSlot[] }> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/recruitment/interviews/slots${qs ? `?${qs}` : ""}`);

  if (!res.ok) throw new Error("Failed to fetch slots");
  return res.json();
}

export async function scheduleInterview(data: {
  applicationId: string;
  scheduledAt: string;
  interviewType?: string;
  notes?: string;
}): Promise<{ success: boolean; interview: InterviewSchedule; message: string }> {
  const res = await fetch(`${API_BASE}/api/recruitment/interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Schedule failed");
  }

  return res.json();
}

export async function respondToInterview(
  interviewId: string,
  action: "CONFIRM" | "RESCHEDULE"
): Promise<{ success: boolean; interview: InterviewSchedule; message: string }> {
  const res = await fetch(`${API_BASE}/api/recruitment/interviews/${interviewId}/respond`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Response failed");
  }

  return res.json();
}

// ============================================================
// AI CHAT
// ============================================================
export async function sendChatMessage(messages: ChatMessage[]): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Chat failed");
  }

  return res.json();
}
