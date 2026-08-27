import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ============================================================
// MULTER CONFIGURATION FOR CV UPLOADS
// ============================================================
const uploadDir = path.join(__dirname, "../../uploads/cvs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${Date.now()}_${basename}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file PDF, DOC hoặc DOCX"));
    }
  }
});

// ============================================================
// DEFAULT JOBS DATA (TBS GROUP JDs)
// ============================================================
const DEFAULT_JOBS = [
  {
    title: "Nhân Viên Lập Trình Số (Digital Programming)",
    salary: "14.000.000 - 15.000.000 VND",
    location: "TBS Zone 2, 2/434 Bình Đáng, Bình Hòa, TP. Hồ Chí Minh",
    description: "Gia nhập TBS Group để kiến tạo tương lai số. Tham gia xây dựng hệ thống quy trình sản xuất thông minh TBS II — nền tảng số hóa toàn diện từ văn phòng điều hành đến nhà xưởng sản xuất. Bạn sẽ làm việc trực tiếp với đội ngũ IT core, xây dựng các module quản lý sản xuất, bảo trì thiết bị và BI dashboard.",
    requirements: "- Thành thạo HTML, CSS, JavaScript cơ bản\n- Có kiến thức về C# và thiết kế đồ họa cơ bản\n- Ưu tiên ứng viên có kinh nghiệm với React/Next.js\n- Có khả năng làm việc độc lập và theo nhóm\n- Tư duy logic tốt, cẩn thận và tỉ mỉ",
    benefits: "- Thu nhập cạnh tranh: 14-15 triệu VND/tháng\n- Môi trường làm việc chuyên nghiệp, năng động\n- Được đào tạo nâng cao kỹ năng lập trình\n- Cơ hội thăng tiến lên Senior Developer\n- Tham gia đầy đủ BHXH, BHYT, BHTN\n- Hỗ trợ ăn trưa và xe đưa đón (tùy vị trí)",
    category: "it",
    educationLevel: "cao-dang",
    slots: 2,
    contactEmail: "tuyendungdaotaovp2@tbsgroup.vn",
    contactPhone: "0905 359 017 (Miss Lịch)",
    province: "TP. Hồ Chí Minh"
  },
  {
    title: "Chuyên Viên Tuyển Dụng & Đào Tạo (HR Recruitment)",
    salary: "12.000.000 - 16.000.000 VND",
    location: "Văn phòng Trụ sở TBS Group, Bình Dương",
    description: "Phụ trách đăng tin tuyển dụng, sàng lọc hồ sơ ứng viên, điều phối phỏng vấn các vị trí phân xưởng và văn phòng. Phối hợp với các trưởng bộ phận để xác định nhu cầu nhân sự và xây dựng kế hoạch tuyển dụng theo từng quý.",
    requirements: "- Tốt nghiệp Đại học chuyên ngành Quản lý Nhân sự, QTKD hoặc liên quan\n- Có ít nhất 1 năm kinh nghiệm tuyển dụng (ưu tiên ngành sản xuất)\n- Thành thạo tin học văn phòng (Word, Excel, PowerPoint)\n- Kỹ năng giao tiếp và phỏng vấn tốt\n- Có khả năng làm việc dưới áp lực cao",
    benefits: "- Thu nhập: 12-16 triệu VND/tháng + thưởng KPI\n- Lộ trình thăng tiến rõ ràng: Chuyên viên → Trưởng nhóm → Phó phòng\n- Được tham gia các khóa đào tạo HR chuyên sâu\n- Du lịch, teambuilding hàng năm\n- BHXH, BHYT, BHTN đầy đủ\n- Môi trường chuyên nghiệp, đồng nghiệp thân thiện",
    category: "hanh-chinh-nhan-su",
    educationLevel: "dai-hoc",
    slots: 1,
    contactEmail: "tuyendungdaotaovp2@tbsgroup.vn",
    contactPhone: "0905 359 017 (Miss Lịch)",
    province: "Bình Dương"
  },
  {
    title: "Kỹ Sư Bảo Trì Máy Cơ Điện (Maintenance Engineer)",
    salary: "15.000.000 - 20.000.000 VND",
    location: "Văn Phòng Chuỗi SKECHERS - TBS Group",
    description: "Chịu trách nhiệm bảo trì, sửa chữa và tối ưu hiệu suất hệ thống máy móc cơ điện tại nhà máy sản xuất giày. Tham gia vào chương trình chuyển đổi số TBS II với hệ thống quét QR code báo lỗi và giám sát thiết bị thời gian thực.",
    requirements: "- Tốt nghiệp Đại học/Cao đẳng chuyên ngành Cơ khí, Cơ điện tử, Điện công nghiệp\n- Có ít nhất 2 năm kinh nghiệm bảo trì máy móc trong nhà máy sản xuất\n- Đọc hiểu bản vẽ kỹ thuật cơ khí và điện\n- Ưu tiên ứng viên có chứng chỉ PLC, khí nén, thủy lực\n- Sẵn sàng làm việc theo ca khi cần thiết",
    benefits: "- Lương cứng: 15-20 triệu VND/tháng + phụ cấp ca đêm\n- Phụ cấp nhà ở cho ứng viên từ xa\n- Đào tạo kỹ thuật nâng cao (PLC, tự động hóa)\n- Bảo hiểm tai nạn 24/24\n- Cơ hội làm việc với công nghệ Industry 4.0",
    category: "ky-thuat",
    educationLevel: "cao-dang",
    slots: 3,
    contactEmail: "tuyendungdaotaovp2@tbsgroup.vn",
    contactPhone: "0905 359 017 (Miss Lịch)",
    province: "TP. Hồ Chí Minh"
  },
  {
    title: "Chuyên Viên Kiểm Soát Chất Lượng (QC Inspector)",
    salary: "10.000.000 - 14.000.000 VND",
    location: "Văn Phòng Chuỗi SKECHERS - TBS Group",
    description: "Kiểm tra chất lượng sản phẩm giày xuất khẩu theo tiêu chuẩn quốc tế của đối tác Decathlon. Giám sát quy trình sản xuất tuân thủ hệ thống quản lý chất lượng ISO 9001:2015. Lập báo cáo và đề xuất cải tiến chất lượng.",
    requirements: "- Tốt nghiệp Trung cấp/Cao đẳng trở lên\n- Có kinh nghiệm QC trong ngành da giày, may mặc là lợi thế\n- Tỉ mỉ, cẩn thận, có mắt thẩm mỹ tốt\n- Biết sử dụng máy tính cơ bản (Excel, Word)\n- Có khả năng đọc hiểu tiếng Anh cơ bản (tài liệu kỹ thuật)",
    benefits: "- Lương: 10-14 triệu VND/tháng + thưởng chất lượng\n- Đào tạo chuyên sâu về tiêu chuẩn QC quốc tế\n- Cơ hội thăng tiến lên QC Supervisor\n- Hỗ trợ ăn trưa và xe đưa đón\n- BHXH, BHYT, BHTN\n- Môi trường làm việc an toàn, sạch sẽ",
    category: "qc",
    educationLevel: "trung-cap",
    slots: 5,
    contactEmail: "tuyendungdaotaovp2@tbsgroup.vn",
    contactPhone: "0905 359 017 (Miss Lịch)",
    province: "TP. Hồ Chí Minh"
  },
  {
    title: "Lập Trình Viên Mobile Native (Kotlin/Swift)",
    salary: "18.000.000 - 25.000.000 VND",
    location: "TP. Hồ Chí Minh / Hybrid",
    description: "Phát triển và bảo trì ứng dụng di động TBS II Mobile dành cho công nhân và kỹ thuật viên bảo trì. Ứng dụng sử dụng C++ shared core, tích hợp quét mã QR báo lỗi máy, nhận ticket bảo trì và cập nhật trạng thái thời gian thực.",
    requirements: "- Thành thạo Kotlin (Android) hoặc Swift (iOS)\n- Có kinh nghiệm với C++ native shared code\n- Hiểu biết về RESTful APIs và WebSocket\n- Có ít nhất 2 năm kinh nghiệm phát triển mobile\n- Ưu tiên ứng viên có ứng dụng đã publish trên Store\n- Có kiến thức về kiến trúc MVVM hoặc Clean Architecture",
    benefits: "- Lương cạnh tranh: 18-25 triệu VND/tháng\n- Làm việc hybrid: 3 ngày tại văn phòng, 2 ngày remote\n- Thiết bị làm việc: MacBook Pro + màn hình 27\"\n- Ngân sách học tập: 500 USD/năm\n- Cơ hội làm việc với công nghệ tiên tiến (QR, BLE, NFC)\n- Team building, du lịch hàng năm",
    category: "it",
    educationLevel: "dai-hoc",
    slots: 2,
    contactEmail: "tuyendungdaotaovp2@tbsgroup.vn",
    contactPhone: "0905 359 017 (Miss Lịch)",
    province: "TP. Hồ Chí Minh"
  },
  {
    title: "Công Nhân Sản Xuất Giày (Sewing/Assembly Worker)",
    salary: "8.000.000 - 12.000.000 VND",
    location: "Văn Phòng Chuỗi SKECHERS - TBS Group",
    description: "Tham gia trực tiếp vào quy trình sản xuất giày xuất khẩu tại Văn Phòng Chuỗi SKECHERS — nhà máy hiện đại với 33 chuyền sản xuất công nghệ cao. Được đào tạo tay nghề bài bản, làm việc trong môi trường an toàn và chuyên nghiệp.",
    requirements: "- Tuổi từ 18-40, sức khỏe tốt\n- Không yêu cầu kinh nghiệm (sẽ được đào tạo)\n- Có tinh thần trách nhiệm, chăm chỉ\n- Có thể làm việc theo ca (ca ngày hoặc ca đêm)",
    benefits: "- Lương cơ bản + tăng ca: 8-12 triệu VND/tháng\n- Living Wage — đảm bảo mức sống tối thiểu\n- Học bổng cho con em CBCNV (9.749 suất năm 2025)\n- Nhà ở công nhân cho ứng viên ở xa\n- Bảo hiểm y tế, tai nạn đầy đủ\n- Xe đưa đón miễn phí\n- Đào tạo tay nghề miễn phí, có lộ trình thăng tiến",
    category: "san-xuat",
    educationLevel: "khong-yeu-cau",
    slots: 50,
    contactEmail: "tuyendungdaotaovp2@tbsgroup.vn",
    contactPhone: "0905 359 017 (Miss Lịch)",
    province: "An Giang"
  },
  {
    title: "Nhân Viên Kho Vận & Logistics",
    salary: "10.000.000 - 13.000.000 VND",
    location: "ICD Tân Vạn, Bình Dương",
    description: "Vận hành và quản lý hàng hóa tại Trung tâm Logistics ICD TBS Tân Vạn — một trong những trung tâm kho bãi hiện đại bậc nhất với diện tích 220.000m² và sức chứa 60.000 container. Tham gia vào quy trình xuất nhập khẩu hàng hóa cho các đối tác quốc tế.",
    requirements: "- Tốt nghiệp THPT trở lên\n- Có kinh nghiệm vận hành xe nâng là lợi thế\n- Biết sử dụng máy tính cơ bản (nhập liệu, quét mã vạch)\n- Có sức khỏe tốt, chịu được môi trường kho bãi\n- Trung thực, cẩn thận, có trách nhiệm với hàng hóa",
    benefits: "- Lương: 10-13 triệu VND/tháng + phụ cấp kho\n- Đào tạo vận hành xe nâng và chứng chỉ logistics\n- BHXH, BHYT, BHTN\n- Hỗ trợ ăn trưa\n- Môi trường làm việc chuyên nghiệp, an toàn\n- Cơ hội thăng tiến lên Tổ trưởng kho",
    category: "logistics",
    educationLevel: "khong-yeu-cau",
    slots: 10,
    contactEmail: "tuyendungdaotaovp2@tbsgroup.vn",
    contactPhone: "0905 359 017 (Miss Lịch)",
    province: "Bình Dương"
  },
  {
    title: "Kế Toán Chi Phí Sản Xuất",
    salary: "12.000.000 - 18.000.000 VND",
    location: "Văn phòng Trụ sở TBS Group, Bình Dương",
    description: "Theo dõi, hạch toán và phân tích chi phí sản xuất cho toàn bộ hệ thống nhà máy. Lập báo cáo giá thành sản phẩm định kỳ, đề xuất giải pháp tối ưu chi phí và tham gia vào quá trình lập ngân sách hàng năm.",
    requirements: "- Tốt nghiệp Đại học chuyên ngành Kế toán, Kiểm toán\n- Có ít nhất 2 năm kinh nghiệm kế toán chi phí (ưu tiên ngành sản xuất)\n- Thành thạo Excel nâng cao và phần mềm kế toán\n- Có chứng chỉ kế toán trưởng là lợi thế\n- Cẩn thận, chính xác, trung thực",
    benefits: "- Lương: 12-18 triệu VND/tháng + thưởng hiệu quả\n- Lộ trình thăng tiến: Kế toán → Kế toán trưởng nhà máy\n- Đào tạo nghiệp vụ và cập nhật chính sách thuế\n- BHXH, BHYT, BHTN\n- Teambuilding và du lịch hàng năm",
    category: "ke-toan",
    educationLevel: "dai-hoc",
    slots: 1,
    contactEmail: "tuyendungdaotaovp2@tbsgroup.vn",
    contactPhone: "0905 359 017 (Miss Lịch)",
    province: "Bình Dương"
  }
];

// ============================================================
// HELPER: SEED JOBS IF DB IS EMPTY
// ============================================================
async function ensureJobsExist() {
  const count = await prisma.job.count();
  if (count === 0) {
    console.log("Seeding recruitment jobs into database...");
    for (const jobData of DEFAULT_JOBS) {
      await prisma.job.create({ data: jobData });
    }
    console.log(`${DEFAULT_JOBS.length} job listings seeded.`);
  }
}

// ============================================================
// 1. PUBLIC: Upload CV file
// ============================================================
router.post("/upload-cv", upload.single("cv"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không tìm thấy file tải lên" });
  }
  const relativeUrl = `/uploads/cvs/${req.file.filename}`;
  return res.json({ cvUrl: relativeUrl, fileName: req.file.originalname, fileSize: req.file.size });
});

// ============================================================
// 2. PUBLIC: List all jobs (with search & filter)
// ============================================================
router.get("/jobs", async (req: Request, res: Response) => {
  try {
    await ensureJobsExist();

    const { search, category, province, departmentId, status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status as string;
    } else {
      where.status = "ACTIVE";
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
        { requirements: { contains: search as string } },
        { location: { contains: search as string } },
      ];
    }
    if (category) where.category = category as string;
    if (province) where.province = province as string;
    if (departmentId) where.departmentId = departmentId as string;

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        department: { select: { name: true, code: true } },
        _count: { select: { applications: true } },
      },
    });

    return res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ error: "Could not fetch jobs" });
  }
});

// ============================================================
// 3. PUBLIC: Get single job detail
// ============================================================
router.get("/jobs/:id", async (req: Request, res: Response) => {
  try {
    await ensureJobsExist();

    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        department: { select: { name: true, code: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Không tìm thấy tin tuyển dụng" });
    }

    // Increment view count
    await prisma.job.update({
      where: { id: job.id },
      data: { viewCount: { increment: 1 } },
    });

    return res.json({ ...job, viewCount: job.viewCount + 1 });
  } catch (error) {
    console.error("Error fetching job detail:", error);
    return res.status(500).json({ error: "Could not fetch job detail" });
  }
});

// ============================================================
// 4. PUBLIC: Apply to job (with CV upload reference)
// ============================================================
router.post("/jobs/:id/apply", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, email, phone, coverLetter, cvUrl } = req.body;

  if (!fullName || !email || !phone || !cvUrl) {
    return res.status(400).json({ error: "Thiếu thông tin ứng tuyển bắt buộc (họ tên, email, số điện thoại, CV)" });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email không đúng định dạng" });
  }

  // Phone format validation (Vietnamese phone: 10-11 digits)
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    return res.status(400).json({ error: "Số điện thoại không đúng định dạng" });
  }

  try {
    await ensureJobsExist();

    let jobExists = await prisma.job.findUnique({ where: { id } });
    if (!jobExists) {
      return res.status(404).json({ error: "Tin tuyển dụng không tồn tại hoặc đã hết hạn" });
    }

    if (jobExists.status !== "ACTIVE") {
      return res.status(400).json({ error: "Tin tuyển dụng này đã đóng" });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobExists.id,
        fullName,
        email,
        phone,
        coverLetter: coverLetter || "",
        cvUrl,
        status: "SUBMITTED",
      },
    });

    // Increment apply count
    await prisma.job.update({
      where: { id: jobExists.id },
      data: { applyCount: { increment: 1 } },
    });

    return res.json({
      success: true,
      application: {
        id: application.id,
        jobTitle: jobExists.title,
        fullName: application.fullName,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt,
      },
      message: "Hồ sơ ứng tuyển đã được gửi thành công. Bộ phận Nhân sự sẽ liên hệ với bạn trong thời gian sớm nhất.",
    });
  } catch (error) {
    console.error("Apply error:", error);
    return res.status(500).json({ error: "Lỗi hệ thống khi nộp đơn ứng tuyển" });
  }
});

// ============================================================
// 5. PUBLIC: Track application by email + application ID
// ============================================================
router.get("/applications/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required to look up application" });
  }

  try {
    const application = await prisma.jobApplication.findFirst({
      where: {
        id,
        email: email as string,
      },
      include: {
        job: { select: { title: true, location: true, salary: true, contactEmail: true, contactPhone: true } },
        interviewSchedule: {
          select: {
            id: true,
            scheduledAt: true,
            location: true,
            meetingLink: true,
            notes: true,
            status: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ ứng tuyển. Vui lòng kiểm tra lại mã hồ sơ và email." });
    }

    return res.json({
      id: application.id,
      fullName: application.fullName,
      email: application.email,
      status: application.status,
      coverLetter: application.coverLetter,
      cvUrl: application.cvUrl,
      createdAt: application.createdAt,
      job: application.job,
      interview: application.interviewSchedule,
    });
  } catch (error) {
    console.error("Error tracking application:", error);
    return res.status(500).json({ error: "Could not fetch application" });
  }
});

// ============================================================
// 6. PUBLIC: Get available interview slots
// ============================================================
router.get("/interviews/slots", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const rangeStart = startDate ? new Date(startDate as string) : new Date();
    const rangeEnd = endDate
      ? new Date(endDate as string)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Use default business hours (Mon-Fri, 8-11 and 13:30-16:30)
    const configs = [
          { dayOfWeek: 1, startTime: "08:00", endTime: "11:00", maxPerSlot: 3 },
          { dayOfWeek: 1, startTime: "13:30", endTime: "16:30", maxPerSlot: 3 },
          { dayOfWeek: 2, startTime: "08:00", endTime: "11:00", maxPerSlot: 3 },
          { dayOfWeek: 2, startTime: "13:30", endTime: "16:30", maxPerSlot: 3 },
          { dayOfWeek: 3, startTime: "08:00", endTime: "11:00", maxPerSlot: 3 },
          { dayOfWeek: 3, startTime: "13:30", endTime: "16:30", maxPerSlot: 3 },
          { dayOfWeek: 4, startTime: "08:00", endTime: "11:00", maxPerSlot: 3 },
          { dayOfWeek: 4, startTime: "13:30", endTime: "16:30", maxPerSlot: 3 },
          { dayOfWeek: 5, startTime: "08:00", endTime: "11:00", maxPerSlot: 3 },
          { dayOfWeek: 5, startTime: "13:30", endTime: "16:30", maxPerSlot: 3 },
        ];

    // Get already booked interviews
    const bookedInterviews = await prisma.interviewSchedule.findMany({
      where: {
        scheduledAt: {
          gte: rangeStart,
          lte: rangeEnd,
        },
        status: { not: "CANCELLED" },
      },
      select: { scheduledAt: true },
    });

    // Build booked count map
    const bookedMap = new Map<string, number>();
    for (const iv of bookedInterviews) {
      const key = iv.scheduledAt.toISOString();
      bookedMap.set(key, (bookedMap.get(key) || 0) + 1);
    }

    // Generate slots
    const availableSlots: any[] = [];
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // At least 24h from now

    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dayConfigs = Array.isArray(configs)
        ? configs.filter((c: any) => c.dayOfWeek === dayOfWeek)
        : [];

      for (const config of dayConfigs) {
        const [startH, startM] = (config.startTime as string).split(":").map(Number);
        const [endH, endM] = (config.endTime as string).split(":").map(Number);

        const slotStart = new Date(d);
        slotStart.setHours(startH, startM, 0, 0);
        const slotEnd = new Date(d);
        slotEnd.setHours(endH, endM, 0, 0);

        // Generate 30-min intervals
        const current = new Date(slotStart);
        while (current < slotEnd) {
          if (current >= minDate) {
            const key = current.toISOString();
            const booked = bookedMap.get(key) || 0;
            const maxPerSlot = (config as any).maxPerSlot || 3;

            availableSlots.push({
              datetime: current.toISOString(),
              date: current.toISOString().split("T")[0],
              time: `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`,
              dayOfWeek,
              available: booked < maxPerSlot,
              remaining: Math.max(0, maxPerSlot - booked),
            });
          }
          current.setMinutes(current.getMinutes() + 30);
        }
      }
    }

    return res.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return res.status(500).json({ error: "Could not fetch interview slots" });
  }
});

// ============================================================
// 7. PUBLIC: Schedule an interview for an application
// ============================================================
router.post("/interviews", async (req: Request, res: Response) => {
  const { applicationId, scheduledAt, interviewType, notes } = req.body;

  if (!applicationId || !scheduledAt) {
    return res.status(400).json({ error: "Thiếu thông tin đặt lịch phỏng vấn" });
  }

  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ ứng tuyển" });
    }

    // Check if already has an interview scheduled
    const existing = await prisma.interviewSchedule.findUnique({
      where: { applicationId },
    });

    if (existing && existing.status !== "CANCELLED") {
      return res.status(400).json({ error: "Hồ sơ này đã có lịch phỏng vấn. Vui lòng liên hệ HR để thay đổi." });
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date(Date.now() + 24 * 60 * 60 * 1000)) {
      return res.status(400).json({ error: "Lịch phỏng vấn phải cách ít nhất 24 giờ" });
    }

    const interview = await prisma.interviewSchedule.create({
      data: {
        applicationId,
        scheduledAt: scheduledDate,
        location: interviewType === "ONLINE" ? "Google Meet (sẽ gửi link qua email)" : application.job.location,
        meetingLink: interviewType === "ONLINE" ? null : null,
        notes: notes || "",
        status: "PENDING",
      },
    });

    // Update application status
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: "INTERVIEW_SCHEDULED" },
    });

    return res.json({
      success: true,
      interview: {
        id: interview.id,
        scheduledAt: interview.scheduledAt,
        location: interview.location,
        status: interview.status,
      },
      message: "Đặt lịch phỏng vấn thành công. Bộ phận Nhân sự sẽ xác nhận trong thời gian sớm nhất.",
    });
  } catch (error) {
    console.error("Interview scheduling error:", error);
    return res.status(500).json({ error: "Lỗi hệ thống khi đặt lịch phỏng vấn" });
  }
});

// ============================================================
// 8. PUBLIC: Confirm/reschedule interview (candidate action)
// ============================================================
router.patch("/interviews/:id/respond", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body; // "CONFIRM" or "RESCHEDULE"

  if (!action || !["CONFIRM", "RESCHEDULE"].includes(action)) {
    return res.status(400).json({ error: "Action must be CONFIRM or RESCHEDULE" });
  }

  try {
    if (action === "CONFIRM") {
      const interview = await prisma.interviewSchedule.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });
      return res.json({ success: true, interview, message: "Lịch phỏng vấn đã được xác nhận." });
    }

    // RESCHEDULE — mark as such (HR will follow up)
    if (action === "RESCHEDULE") {
      const interview = await prisma.interviewSchedule.update({
        where: { id },
        data: { status: "RESCHEDULED" },
      });
      return res.json({ success: true, interview, message: "Yêu cầu đổi lịch đã được ghi nhận. HR sẽ liên hệ lại." });
    }
  } catch (error) {
    console.error("Interview respond error:", error);
    return res.status(500).json({ error: "Could not process request" });
  }
});

// ============================================================
// AUTH MIDDLEWARE FOR HR/ADMIN ROUTES
// ============================================================
const requireHR = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const isHR =
    req.user.role === "ADMIN" ||
    req.user.role === "GIAM_DOC" ||
    req.user.role === "TRUONG_PHONG" ||
    req.user.departmentId === "HRD";
  if (isHR) {
    next();
  } else {
    return res.status(403).json({ error: "Không có quyền truy cập. Chỉ dành cho Nhân sự (HR)" });
  }
};

// ============================================================
// A1. HR: View all applications
// ============================================================
router.get("/hr/applications", authenticateToken as any, requireHR as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, jobId } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (jobId) where.jobId = jobId as string;

    const apps = await prisma.jobApplication.findMany({
      where,
      include: {
        job: { select: { title: true, location: true } },
        interviewSchedule: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(apps);
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch applications" });
  }
});

// ============================================================
// A2. HR: Update application status
// ============================================================
router.patch("/hr/applications/:id/status", authenticateToken as any, requireHR as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, statusNotes } = req.body;
  const validStatuses = ["SUBMITTED", "REVIEWING", "INTERVIEW_SCHEDULED", "ACCEPTED", "REJECTED"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const app = await prisma.jobApplication.update({
      where: { id },
      data: {
        status,
        ...(statusNotes ? { /* Note: add statusNotes field if desired */ } : {}),
      },
      include: { job: { select: { title: true } } },
    });
    return res.json({ success: true, application: app });
  } catch (error) {
    return res.status(500).json({ error: "Could not update application status" });
  }
});

// ============================================================
// A3. HR: Post new job
// ============================================================
router.post("/hr/jobs", authenticateToken as any, requireHR as any, async (req: AuthenticatedRequest, res: Response) => {
  const { title, salary, location, description, requirements, benefits, slots, category, educationLevel, contactEmail, contactPhone, province, expiresAt } = req.body;

  if (!title || !salary || !location || !description || !requirements) {
    return res.status(400).json({ error: "Thiếu thông tin đăng tuyển (tiêu đề, lương, địa điểm, mô tả, yêu cầu)" });
  }

  try {
    const job = await prisma.job.create({
      data: {
        title,
        salary,
        location,
        description,
        requirements,
        benefits: benefits || "",
        slots: slots || 1,
        category: category || "",
        educationLevel: educationLevel || "",
        contactEmail: contactEmail || "tuyendungdaotaovp2@tbsgroup.vn",
        contactPhone: contactPhone || "0905 359 017 (Miss Lịch)",
        province: province || "",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return res.json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ error: "Could not create job listing" });
  }
});

// ============================================================
// A4. HR: Update job posting
// ============================================================
router.patch("/hr/jobs/:id", authenticateToken as any, requireHR as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const allowedFields = ["title", "salary", "location", "description", "requirements", "benefits", "slots", "category", "educationLevel", "contactEmail", "contactPhone", "province", "status", "expiresAt"];
  const updateData: any = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = field === "expiresAt" && req.body[field] ? new Date(req.body[field]) : req.body[field];
    }
  }

  try {
    const job = await prisma.job.update({
      where: { id },
      data: updateData,
    });
    return res.json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ error: "Could not update job listing" });
  }
});

// ============================================================
// A5. HR: Delete job vacancy
// ============================================================
router.delete("/hr/jobs/:id", authenticateToken as any, requireHR as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.job.delete({ where: { id } });
    return res.json({ success: true, message: "Đã xóa tin tuyển dụng thành công" });
  } catch (error) {
    return res.status(500).json({ error: "Could not delete job vacancy" });
  }
});

// ============================================================
// A6. HR: View all scheduled interviews
// ============================================================
router.get("/hr/interviews", authenticateToken as any, requireHR as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interviews = await prisma.interviewSchedule.findMany({
      include: {
        application: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            cvUrl: true,
            job: { select: { title: true, location: true } },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return res.json(interviews);
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch interviews" });
  }
});

// ============================================================
// A7. HR: Update interview status
// ============================================================
router.patch("/hr/interviews/:id", authenticateToken as any, requireHR as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, meetingLink, location, notes } = req.body;

  try {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;

    const interview = await prisma.interviewSchedule.update({
      where: { id },
      data: updateData,
    });

    // If interview completed, update application
    if (status === "COMPLETED") {
      await prisma.jobApplication.update({
        where: { id: interview.applicationId },
        data: { status: "REVIEWING" },
      });
    }

    return res.json({ success: true, interview });
  } catch (error) {
    return res.status(500).json({ error: "Could not update interview" });
  }
});

// ============================================================
// A8. HR: Upload Excel file to bulk-create jobs
// ============================================================
import * as XLSX from "xlsx";

// Separate multer config for Excel upload
const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file Excel (.xlsx hoặc .xls)"));
    }
  },
});

// Column mapping: Excel header (Vietnamese) → Job field
const COLUMN_MAP: Record<string, string> = {
  "tiêu đề": "title",
  "tieu de": "title",
  "vị trí": "title",
  "vi tri": "title",
  "chức danh": "title",
  "chuc danh": "title",
  "mức lương": "salary",
  "muc luong": "salary",
  "lương": "salary",
  "luong": "salary",
  "địa điểm": "location",
  "dia diem": "location",
  "nơi làm việc": "location",
  "noi lam viec": "location",
  "mô tả": "description",
  "mo ta": "description",
  "mô tả công việc": "description",
  "mo ta cong viec": "description",
  "yêu cầu": "requirements",
  "yeu cau": "requirements",
  "yêu cầu ứng viên": "requirements",
  "yeu cau ung vien": "requirements",
  "quyền lợi": "benefits",
  "quyen loi": "benefits",
  "phúc lợi": "benefits",
  "phuc loi": "benefits",
  "chế độ": "benefits",
  "che do": "benefits",
  "số lượng": "slots",
  "so luong": "slots",
  "slots": "slots",
  "ngành nghề": "category",
  "nganh nghe": "category",
  "lĩnh vực": "category",
  "linh vuc": "category",
  "trình độ": "educationLevel",
  "trinh do": "educationLevel",
  "học vấn": "educationLevel",
  "hoc van": "educationLevel",
  "bằng cấp": "educationLevel",
  "bang cap": "educationLevel",
  "tỉnh": "province",
  "tinh": "province",
  "tỉnh/tp": "province",
  "tinh/tp": "province",
  "thành phố": "province",
  "thanh pho": "province",
  "địa chỉ": "province",
  "dia chi": "province",
  "email": "contactEmail",
  "email liên hệ": "contactEmail",
  "email lien he": "contactEmail",
  "số điện thoại": "contactPhone",
  "so dien thoai": "contactPhone",
  "sđt": "contactPhone",
  "sdt": "contactPhone",
  "điện thoại": "contactPhone",
  "dien thoai": "contactPhone",
  "hạn nộp": "expiresAt",
  "han nop": "expiresAt",
  "ngày hết hạn": "expiresAt",
  "ngay het han": "expiresAt",
  "deadline": "expiresAt",
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // Remove Vietnamese diacritics
}

function mapRow(row: Record<string, string>): any {
  const job: any = {};
  const missingFields: string[] = [];

  for (const [header, value] of Object.entries(row)) {
    const normalized = normalizeHeader(header);
    const field = COLUMN_MAP[normalized];

    if (field && value && String(value).trim()) {
      const trimmedValue = String(value).trim();

      if (field === "slots") {
        job[field] = parseInt(trimmedValue) || 1;
      } else if (field === "expiresAt") {
        // Try to parse as date
        const parsed = new Date(trimmedValue);
        if (!isNaN(parsed.getTime())) {
          job[field] = parsed;
        }
        // If invalid date, just use the string
      } else {
        job[field] = trimmedValue;
      }
    }
  }

  // Set defaults
  if (!job.slots) job.slots = 1;
  if (!job.contactEmail) job.contactEmail = "tuyendungdaotaovp2@tbsgroup.vn";
  if (!job.contactPhone) job.contactPhone = "0905 359 017 (Miss Lịch)";

  return job;
}

router.post(
  "/hr/jobs/upload-excel",
  authenticateToken as any,
  requireHR as any,
  (req: AuthenticatedRequest, res: Response, next: any) => {
    excelUpload.single("file")(req, res, (err) => {
      if (err) {
        if (err.message.includes("Chỉ chấp nhận")) {
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: "Lỗi khi tải file lên" });
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng chọn file Excel để tải lên" });
    }

    try {
      // Parse Excel from buffer
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return res.status(400).json({ error: "File Excel không có sheet dữ liệu nào" });
      }

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

      if (rows.length === 0) {
        return res.status(400).json({ error: "File Excel không có dữ liệu. Vui lòng kiểm tra lại." });
      }

      const results = {
        total: rows.length,
        created: 0,
        skipped: 0,
        errors: [] as { row: number; reason: string }[],
        jobs: [] as any[],
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const jobData = mapRow(row);

        // Validate required fields
        if (!jobData.title || !jobData.title.trim()) {
          results.errors.push({ row: i + 2, reason: `Dòng ${i + 2}: Thiếu tiêu đề công việc` });
          results.skipped++;
          continue;
        }

        if (!jobData.salary || !jobData.salary.trim()) {
          results.errors.push({ row: i + 2, reason: `Dòng ${i + 2}: Thiếu mức lương` });
          results.skipped++;
          continue;
        }

        if (!jobData.location || !jobData.location.trim()) {
          results.errors.push({ row: i + 2, reason: `Dòng ${i + 2}: Thiếu địa điểm làm việc` });
          results.skipped++;
          continue;
        }

        if (!jobData.description || !jobData.description.trim()) {
          results.errors.push({ row: i + 2, reason: `Dòng ${i + 2}: Thiếu mô tả công việc` });
          results.skipped++;
          continue;
        }

        if (!jobData.requirements || !jobData.requirements.trim()) {
          results.errors.push({ row: i + 2, reason: `Dòng ${i + 2}: Thiếu yêu cầu ứng viên` });
          results.skipped++;
          continue;
        }

        try {
          const job = await prisma.job.create({ data: jobData });
          results.jobs.push({ id: job.id, title: job.title });
          results.created++;
        } catch (createErr: any) {
          results.errors.push({ row: i + 2, reason: `Dòng ${i + 2}: ${createErr.message}` });
          results.skipped++;
        }
      }

      return res.json({
        success: true,
        message: `Đã tạo ${results.created}/${results.total} tin tuyển dụng thành công${results.skipped > 0 ? ` (${results.skipped} dòng bị bỏ qua)` : ""}`,
        ...results,
      });
    } catch (error: any) {
      console.error("Excel upload error:", error);
      return res.status(500).json({ error: "Không thể xử lý file Excel. Vui lòng kiểm tra định dạng file." });
    }
  }
);

// ============================================================
// A9. HR: Download Excel template
// ============================================================
router.get("/hr/jobs/template", authenticateToken as any, requireHR as any, (req: AuthenticatedRequest, res: Response) => {
  // Create a template workbook
  const wb = XLSX.utils.book_new();

  const templateData = [
    {
      "Tiêu đề": "Nhân Viên Lập Trình Số",
      "Mức lương": "14.000.000 - 15.000.000 VND",
      "Địa điểm": "TBS Zone 2, TP. Hồ Chí Minh",
      "Mô tả": "Tham gia xây dựng hệ thống quy trình sản xuất thông minh TBS II...",
      "Yêu cầu": "- Thành thạo HTML, CSS, JavaScript\n- Có kiến thức về C#",
      "Quyền lợi": "- Thu nhập cạnh tranh\n- BHXH, BHYT, BHTN\n- Đào tạo nâng cao",
      "Số lượng": "2",
      "Ngành nghề": "it",
      "Trình độ": "cao-dang",
      "Tỉnh/TP": "TP. Hồ Chí Minh",
      "Email liên hệ": "tuyendungdaotaovp2@tbsgroup.vn",
      "SĐT liên hệ": "0905 359 017 (Miss Lịch)",
      "Hạn nộp": "2026-12-31",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  ws["!cols"] = [
    { wch: 35 }, // Tiêu đề
    { wch: 25 }, // Mức lương
    { wch: 35 }, // Địa điểm
    { wch: 50 }, // Mô tả
    { wch: 40 }, // Yêu cầu
    { wch: 40 }, // Quyền lợi
    { wch: 10 }, // Số lượng
    { wch: 20 }, // Ngành nghề
    { wch: 15 }, // Trình độ
    { wch: 20 }, // Tỉnh/TP
    { wch: 30 }, // Email
    { wch: 25 }, // SĐT
    { wch: 15 }, // Hạn nộp
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Tin tuyển dụng");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=TBS_TuyenDung_Mau.xlsx");
  res.send(buffer);
});

export default router;
