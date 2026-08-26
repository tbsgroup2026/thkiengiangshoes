// Language Translation System for TBS Group

export type LanguageCode = "VN" | "ENG";

export interface Translations {
  // Common UI
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    submit: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    back: string;
    next: string;
    previous: string;
    confirm: string;
    reject: string;
    approve: string;
    pending: string;
    completed: string;
    failed: string;
    retry: string;
    search: string;
    filter: string;
    reset: string;
    download: string;
    upload: string;
    export: string;
    import: string;
  };

  // Navigation
  nav: {
    home: string;
    tbs_group: string;
    recruitment: string;
    templates: string;
    management_system: string;
    news: string;
    other: string;
    contact: string;
    faq: string;
    organization: string;
  };

  // Business Trip
  business_trip: {
    title: string;
    create_proposal: string;
    trip_info: string;
    traveler_info: string;
    region: string;
    factory: string;
    location: string;
    creator: string;
    department: string;
    transport: string;
    start_date: string;
    end_date: string;
    num_days: string;
    purpose: string;
    address: string;
    estimated_cost: string;
    trip_proposal: string;
    form_tab: string;
    list_tab: string;
    participants: string;
    add_participant: string;
    remove_participant: string;
    attachments: string;
    add_attachment: string;
    invoices: string;
    approve_l1: string;
    approve_l2: string;
    reject: string;
    approval_status: string;
    status_pending: string;
    status_pending_l2: string;
    status_approved: string;
    status_rejected: string;
    auto_from_current_account: string;
    submit_trip: string;
    trip_submitted_success: string;
    trip_creation_error: string;
  };

  // Validation
  validation: {
    required_field: string;
    invalid_email: string;
    invalid_phone: string;
    password_too_short: string;
    passwords_not_match: string;
    trip_name_required: string;
    region_required: string;
    factory_required: string;
    location_required: string;
    transport_required: string;
    purpose_required: string;
  };

  // User Profile
  profile: {
    personal_info: string;
    change_password: string;
    logout: string;
    admin_mode: string;
    name: string;
    email: string;
    phone: string;
    title: string;
    department: string;
    employee_code: string;
    avatar: string;
    current_password: string;
    new_password: string;
    confirm_password: string;
    old_password: string;
    save_profile: string;
    change_password_success: string;
    profile_updated: string;
  };

  // Messages
  messages: {
    welcome: string;
    goodbye: string;
    loading_data: string;
    no_data: string;
    confirm_delete: string;
    confirm_logout: string;
    confirm_reject: string;
    operation_successful: string;
    operation_failed: string;
    please_wait: string;
    unauthorized: string;
    forbidden: string;
    not_found: string;
    server_error: string;
    network_error: string;
  };

  // Hero Section & Landing
  hero: {
    chain_office: string;
    skechers_tbs: string;
    excellence_manufacturing: string;
    operating_space: string;
    access_system: string;
    explore_space: string;
    years_experience: string;
    products_year: string;
    operational_staff: string;
    brand_partners: string;
  };

  // Workspace Gallery
  workspace: {
    corporate_environment: string;
    each_space_created: string;
    all: string;
    photos_count: string;
    additional_views: string;
    view_more: string;
    close: string;
    prev_image: string;
    next_image: string;
  };

  // Footer
  footer: {
    about_tbs: string;
    history: string;
    vision_mission: string;
    core_values: string;
    news_events: string;
    press_center: string;
    sustainable_development: string;
    living_wage: string;
    recruitment: string;
    scholarships: string;
    hr_contact: string;
    internal: string;
    terms_service: string;
    privacy_policy: string;
    iso_certificate: string;
    sbti_carbon: string;
    copyright: string;
    all_rights_reserved: string;
    terms: string;
    privacy: string;
    cookies: string;
  };
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  VN: {
    common: {
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      edit: "Chỉnh sửa",
      create: "Tạo mới",
      submit: "Gửi",
      close: "Đóng",
      loading: "Đang tải...",
      error: "Lỗi",
      success: "Thành công",
      warning: "Cảnh báo",
      info: "Thông tin",
      back: "Quay lại",
      next: "Tiếp theo",
      previous: "Trước đó",
      confirm: "Xác nhận",
      reject: "Từ chối",
      approve: "Phê duyệt",
      pending: "Đang chờ",
      completed: "Hoàn tất",
      failed: "Thất bại",
      retry: "Thử lại",
      search: "Tìm kiếm",
      filter: "Lọc",
      reset: "Đặt lại",
      download: "Tải xuống",
      upload: "Tải lên",
      export: "Xuất",
      import: "Nhập",
    },

    nav: {
      home: "Trang Chủ",
      tbs_group: "TBS Group",
      recruitment: "Tuyển Dụng",
      templates: "Thư Viện Mẫu",
      management_system: "Hệ Thống Quản Trị",
      news: "Tin Tức",
      other: "Khác",
      contact: "Liên Hệ",
      faq: "Câu Hỏi Thường Gặp (FAQ)",
      organization: "Sơ Đồ Tổ Chức / Chi Nhánh",
    },

    business_trip: {
      title: "Đăng Ký Công Tác",
      create_proposal: "Tạo Đề Xuất Công Tác",
      trip_info: "Thông Tin Chuyến Công Tác",
      traveler_info: "Thông Tin Người Tham Gia",
      region: "Khu Vực",
      factory: "Nhà Máy",
      location: "Công Tác Tại",
      creator: "Người Tạo",
      department: "Bộ Phận",
      transport: "Hình Thức Di Chuyển",
      start_date: "Ngày Bắt Đầu",
      end_date: "Ngày Kết Thúc",
      num_days: "Số Ngày",
      purpose: "Mục Đích",
      address: "Địa Chỉ",
      estimated_cost: "Chi Phí Dự Kiến (VND)",
      trip_proposal: "Đề Xuất Công Tác",
      form_tab: "Nhập Liệu",
      list_tab: "Danh Sách",
      participants: "Người Tham Gia",
      add_participant: "Thêm Người Tham Gia",
      remove_participant: "Xóa Người Tham Gia",
      attachments: "Tài Liệu Đính Kèm",
      add_attachment: "Thêm Tài Liệu",
      invoices: "Hóa Đơn / Chứng Từ",
      approve_l1: "Duyệt Cấp 1",
      approve_l2: "Duyệt Cấp 2",
      reject: "Từ Chối",
      approval_status: "Trạng Thái Duyệt",
      status_pending: "Chờ Duyệt",
      status_pending_l2: "Chờ Ban Giám Đốc",
      status_approved: "Đã Phê Duyệt",
      status_rejected: "Bị Từ Chối",
      auto_from_current_account: "Tự động từ tài khoản hiện tại",
      submit_trip: "Gửi Đề Xuất Công Tác",
      trip_submitted_success: "Đã gửi đề xuất công tác thành công!",
      trip_creation_error: "Lỗi tạo đề xuất công tác",
    },

    validation: {
      required_field: "Trường này là bắt buộc",
      invalid_email: "Email không hợp lệ",
      invalid_phone: "Số điện thoại không hợp lệ",
      password_too_short: "Mật khẩu phải có ít nhất 6 ký tự",
      passwords_not_match: "Mật khẩu xác nhận không khớp",
      trip_name_required: "Tên đề xuất công tác là bắt buộc",
      region_required: "Khu vực là bắt buộc",
      factory_required: "Nhà máy là bắt buộc",
      location_required: "Công tác tại là bắt buộc",
      transport_required: "Hình thức di chuyển là bắt buộc",
      purpose_required: "Mục đích công tác là bắt buộc",
    },

    profile: {
      personal_info: "Thông tin cá nhân",
      change_password: "Đổi mật khẩu",
      logout: "Đăng xuất",
      admin_mode: "Trang Quản Trị (Admin Mode)",
      name: "Họ và tên",
      email: "Email",
      phone: "Số điện thoại",
      title: "Chức danh",
      department: "Bộ phận",
      employee_code: "Mã nhân viên",
      avatar: "Ảnh đại diện",
      current_password: "Mật khẩu hiện tại",
      new_password: "Mật khẩu mới",
      confirm_password: "Xác nhận mật khẩu",
      old_password: "Mật khẩu cũ",
      save_profile: "Lưu thông tin",
      change_password_success: "Đã cập nhật mật khẩu thành công!",
      profile_updated: "Đã cập nhật thông tin cá nhân thành công!",
    },

    messages: {
      welcome: "Chào mừng bạn!",
      goodbye: "Tạm biệt!",
      loading_data: "Đang tải dữ liệu...",
      no_data: "Không có dữ liệu",
      confirm_delete: "Bạn có chắc chắn muốn xóa?",
      confirm_logout: "Bạn có chắc chắn muốn đăng xuất?",
      confirm_reject: "Bạn có chắc chắn muốn từ chối?",
      operation_successful: "Thao tác thành công",
      operation_failed: "Thao tác thất bại",
      please_wait: "Vui lòng chờ...",
      unauthorized: "Không được phép",
      forbidden: "Bị cấm",
      not_found: "Không tìm thấy",
      server_error: "Lỗi máy chủ",
      network_error: "Lỗi kết nối mạng",
    },

    hero: {
      chain_office: "Văn Phòng Chuỗi",
      skechers_tbs: "SKECHERS - TBS Group",
      excellence_manufacturing: "Excellence in Manufacturing. Excellence in Leadership.",
      operating_space: "Không gian điều hành đại diện cho năng lực quản trị, văn hóa doanh nghiệp và tiêu chuẩn vận hành của ngành SKECHERS - TBS Group.",
      access_system: "Truy Cập Hệ Thống",
      explore_space: "Khám Phá Không Gian",
      years_experience: "Năm Kinh Nghiệm",
      products_year: "Sản Phẩm / Năm",
      operational_staff: "Nhân Sự Vận Hành",
      brand_partners: "ĐỐI TÁC THƯƠNG HIỆU TIN CẬY",
    },

    workspace: {
      corporate_environment: "Môi trường làm việc chuẩn Corporate",
      each_space_created: "Mỗi không gian được kiến tạo nhằm thúc đẩy hiệu suất, sự kết nối và tinh thần đổi mới.",
      all: "Tất Cả",
      photos_count: "Ảnh thực tế",
      additional_views: "Các góc nhìn không gian bổ sung",
      view_more: "Xem Thêm",
      close: "Đóng",
      prev_image: "Ảnh trước",
      next_image: "Ảnh tiếp theo",
    },

    footer: {
      about_tbs: "Giới thiệu",
      history: "Lịch sử",
      vision_mission: "Tầm nhìn & Sứ mệnh",
      core_values: "Giá trị cốt lõi",
      news_events: "Tin tức & Sự kiện",
      press_center: "Press Center",
      sustainable_development: "Phát triển bền vững",
      living_wage: "Living Wage",
      recruitment: "Tuyển dụng",
      scholarships: "Học bổng Khuyến học",
      hr_contact: "Liên hệ HR",
      internal: "Nội bộ",
      terms_service: "Điều khoản dịch vụ",
      privacy_policy: "Chính sách bảo mật",
      iso_certificate: "ISO 9001:2015",
      sbti_carbon: "SBTi Carbon",
      copyright: "Tất cả quyền được bảo lưu.",
      all_rights_reserved: "Tất cả quyền được bảo lưu.",
      terms: "Điều khoản",
      privacy: "Bảo mật",
      cookies: "Cookies",
    },
  },

  ENG: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      submit: "Submit",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information",
      back: "Back",
      next: "Next",
      previous: "Previous",
      confirm: "Confirm",
      reject: "Reject",
      approve: "Approve",
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
      retry: "Retry",
      search: "Search",
      filter: "Filter",
      reset: "Reset",
      download: "Download",
      upload: "Upload",
      export: "Export",
      import: "Import",
    },

    nav: {
      home: "Home",
      tbs_group: "TBS Group",
      recruitment: "Recruitment",
      templates: "Templates",
      management_system: "Management System",
      news: "News",
      other: "Other",
      contact: "Contact",
      faq: "FAQ",
      organization: "Organization / Branches",
    },

    business_trip: {
      title: "Business Trip Registration",
      create_proposal: "Create Trip Proposal",
      trip_info: "Trip Information",
      traveler_info: "Traveler Information",
      region: "Region",
      factory: "Factory",
      location: "Trip Location",
      creator: "Creator",
      department: "Department",
      transport: "Transportation Method",
      start_date: "Start Date",
      end_date: "End Date",
      num_days: "Number of Days",
      purpose: "Purpose",
      address: "Address",
      estimated_cost: "Estimated Cost (VND)",
      trip_proposal: "Trip Proposal",
      form_tab: "Input Form",
      list_tab: "List",
      participants: "Participants",
      add_participant: "Add Participant",
      remove_participant: "Remove Participant",
      attachments: "Attachments",
      add_attachment: "Add Attachment",
      invoices: "Invoices / Receipts",
      approve_l1: "Approve Level 1",
      approve_l2: "Approve Level 2",
      reject: "Reject",
      approval_status: "Approval Status",
      status_pending: "Pending",
      status_pending_l2: "Pending Board Approval",
      status_approved: "Approved",
      status_rejected: "Rejected",
      auto_from_current_account: "Auto from current account",
      submit_trip: "Submit Trip Proposal",
      trip_submitted_success: "Trip proposal submitted successfully!",
      trip_creation_error: "Error creating trip proposal",
    },

    validation: {
      required_field: "This field is required",
      invalid_email: "Invalid email address",
      invalid_phone: "Invalid phone number",
      password_too_short: "Password must be at least 6 characters",
      passwords_not_match: "Passwords do not match",
      trip_name_required: "Trip name is required",
      region_required: "Region is required",
      factory_required: "Factory is required",
      location_required: "Trip location is required",
      transport_required: "Transportation method is required",
      purpose_required: "Purpose is required",
    },

    profile: {
      personal_info: "Personal Information",
      change_password: "Change Password",
      logout: "Logout",
      admin_mode: "Admin Panel",
      name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      title: "Job Title",
      department: "Department",
      employee_code: "Employee Code",
      avatar: "Avatar",
      current_password: "Current Password",
      new_password: "New Password",
      confirm_password: "Confirm Password",
      old_password: "Old Password",
      save_profile: "Save Profile",
      change_password_success: "Password updated successfully!",
      profile_updated: "Profile updated successfully!",
    },

    messages: {
      welcome: "Welcome!",
      goodbye: "Goodbye!",
      loading_data: "Loading data...",
      no_data: "No data available",
      confirm_delete: "Are you sure you want to delete?",
      confirm_logout: "Are you sure you want to logout?",
      confirm_reject: "Are you sure you want to reject?",
      operation_successful: "Operation completed successfully",
      operation_failed: "Operation failed",
      please_wait: "Please wait...",
      unauthorized: "Unauthorized",
      forbidden: "Forbidden",
      not_found: "Not found",
      server_error: "Server error",
      network_error: "Network error",
    },

    hero: {
      chain_office: "Supply Chain Office",
      skechers_tbs: "SKECHERS - TBS Group",
      excellence_manufacturing: "Excellence in Manufacturing. Excellence in Leadership.",
      operating_space: "Operating space representing management capability, corporate culture and operational standards of SKECHERS - TBS Group.",
      access_system: "Access System",
      explore_space: "Explore Space",
      years_experience: "Years of Experience",
      products_year: "Products / Year",
      operational_staff: "Operational Staff",
      brand_partners: "TRUSTED BRAND PARTNERS",
    },

    workspace: {
      corporate_environment: "Standard corporate working environment",
      each_space_created: "Each space is designed to promote efficiency, connection and innovation.",
      all: "All",
      photos_count: "Real photos",
      additional_views: "Additional workspace views",
      view_more: "View More",
      close: "Close",
      prev_image: "Previous image",
      next_image: "Next image",
    },

    footer: {
      about_tbs: "About",
      history: "History",
      vision_mission: "Vision & Mission",
      core_values: "Core Values",
      news_events: "News & Events",
      press_center: "Press Center",
      sustainable_development: "Sustainable Development",
      living_wage: "Living Wage",
      recruitment: "Recruitment",
      scholarships: "Scholarships",
      hr_contact: "HR Contact",
      internal: "Internal",
      terms_service: "Terms of Service",
      privacy_policy: "Privacy Policy",
      iso_certificate: "ISO 9001:2015",
      sbti_carbon: "SBTi Carbon",
      copyright: "All rights reserved.",
      all_rights_reserved: "All rights reserved.",
      terms: "Terms",
      privacy: "Privacy",
      cookies: "Cookies",
    },
  },
};

/**
 * Get translation by language and key path
 * Usage: translate("common.save", "VN") => "Lưu"
 */
export function translate(
  keyPath: string,
  lang: LanguageCode = "VN"
): string {
  const keys = keyPath.split(".");
  let value: any = TRANSLATIONS[lang];

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      console.warn(`Translation not found: ${keyPath} for language ${lang}`);
      return keyPath;
    }
  }

  return typeof value === "string" ? value : keyPath;
}

/**
 * Hook-like function to get current language from localStorage
 */
export function getCurrentLanguage(): LanguageCode {
  if (typeof window === "undefined") return "VN";
  try {
    const saved = localStorage.getItem("tbs_lang") as LanguageCode;
    return saved && (saved === "VN" || saved === "ENG") ? saved : "VN";
  } catch {
    return "VN";
  }
}

/**
 * Get all translations for a language
 */
export function getTranslations(lang: LanguageCode): Translations {
  return TRANSLATIONS[lang];
}

export default TRANSLATIONS;
