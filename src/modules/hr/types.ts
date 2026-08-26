export type HRRoleMode = "manager" | "staff" | "employee";

export type HRTabKey =
  | "overview"
  | "directory"
  | "contracts"
  | "lifecycle"
  | "recruitment"
  | "attendance_payroll"
  | "talent_performance"
  | "reports";

export interface HREmployee {
  id: string;
  name: string;
  title: string;
  department: string;
  branch: string;
  email: string;
  phone: string;
  status: "Active" | "Probation" | "Onboarding" | "Resigned";
  contractType: "Chính thức (Không XĐTH)" | "Chính thức (2 năm)" | "Thử việc" | "Hợp đồng mùa vụ";
  joinDate: string;
  probationEndDate?: string;
  contractEndDate?: string;
  avatar: string;
  salaryBase?: string;
  performanceScore?: string;
  isHighPerformer?: boolean;
}

export interface HRContract {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Expiring" | "Expired" | "Pending_Sign";
  salary: string;
}

export interface HRRequisition {
  id: string;
  title: string;
  department: string;
  quantity: number;
  salaryRange: string;
  reason: string;
  status: "Draft" | "Pending_Manager" | "Pending_CEO" | "Approved" | "Rejected";
  requesterName: string;
  requestDate: string;
  applicantsCount: number;
}

export interface HROnboardingTask {
  id: string;
  employeeName: string;
  department: string;
  joinDate: string;
  mentor: string;
  progress: number; // 0 - 100%
  items: { text: string; done: boolean }[];
}

export interface HROffboardingTask {
  id: string;
  employeeName: string;
  department: string;
  resignDate: string;
  reason: string;
  assetHandoverDone: boolean;
  workHandoverDone: boolean;
  accountLocked: boolean;
  finalPayrollDone: boolean;
  status: "Processing" | "Completed";
}

export interface HRLeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  leaveType: "Phép năm" | "Thai sản" | "Việc riêng" | "Bệnh";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending_HR" | "Approved" | "Rejected";
}

export interface HRWorkflowDoc {
  id: string;
  title: string;
  docType: "Quyết định tuyển dụng" | "Hợp đồng lao động" | "Quyết định bổ nhiệm" | "Tờ trình tăng lương" | "Thanh lý hợp đồng";
  employeeName: string;
  department: string;
  submittedBy: string;
  date: string;
  currentStep: "Soạn thảo" | "Chuyên viên HR" | "Trưởng phòng HR" | "Sếp Tổng (TGĐ)" | "Hoàn tất";
  status: "Pending" | "Approved" | "Rejected";
  comments: { user: string; text: string; time: string }[];
}
