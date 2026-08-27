import 'package:flutter/material.dart';
import '../services/api_service.dart';

class GuestPortalScreen extends StatefulWidget {
  final VoidCallback onGoToLogin;
  const GuestPortalScreen({Key? key, required this.onGoToLogin}) : super(key: key);

  @override
  State<GuestPortalScreen> createState() => _GuestPortalScreenState();
}

class _GuestPortalScreenState extends State<GuestPortalScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('>>> TBS GROUP - GUEST PORTAL'),
        actions: [
          TextButton.icon(
            onPressed: widget.onGoToLogin,
            icon: const Icon(Icons.login, size: 16, color: Color(0xFF06B6D4)),
            label: const Text('ĐĂNG NHẬP', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold)),
          )
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF06B6D4),
          labelColor: const Color(0xFF06B6D4),
          unselectedLabelColor: const Color(0xFF94A3B8),
          labelStyle: const TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: 'GIỚI THIỆU', icon: Icon(Icons.info_outline, size: 18)),
            Tab(text: 'TUYỂN DỤNG', icon: Icon(Icons.work_outline, size: 18)),
            Tab(text: 'QUY TRÌNH', icon: Icon(Icons.menu_book, size: 18)),
            Tab(text: 'LIÊN HỆ', icon: Icon(Icons.contact_mail_outlined, size: 18)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          const GuestIntroTab(),
          const GuestJobsTab(),
          const GuestProcessTab(),
          const GuestContactTab(),
        ],
      ),
    );
  }
}

// 1. INTRO TAB
class GuestIntroTab extends StatelessWidget {
  const GuestIntroTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('>>> VĂN PHÒNG CHUỖI SKECHERS', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('TBS DIGITAL FACTORY // SKECHERS', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11)),
          const SizedBox(height: 16),
          const Text(
            'Văn Phòng Chuỗi SKECHERS thuộc tập đoàn TBS Group là một trong những cơ sở quản trị vận hành hiện đại hàng đầu. Định hướng chuyển đổi số toàn diện và vận hành hệ thống thông minh phục vụ các đối tác quốc tế như Skechers, Decathlon.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
          ),
          const SizedBox(height: 20),
          const Divider(color: Color(0xFF1E293B)),
          const SizedBox(height: 16),
          const Text('// QUY MÔ & NĂNG LỰC SẢN XUẤT', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildStatRow('Năm phát triển', '8 năm hoạt động liên tục (từ 2017)'),
          _buildStatRow('Hạ tầng sản xuất', '2 nhà máy hiện đại quy mô lớn'),
          _buildStatRow('Lực lượng lao động', 'Hơn 5,000 nhân sự chất lượng cao'),
          _buildStatRow('Năng lực đầu ra', '10 triệu đôi giày xuất khẩu/năm'),
          const SizedBox(height: 20),
          const Divider(color: Color(0xFF1E293B)),
          const SizedBox(height: 16),
          const Text('// LỊCH SỬ PHÁT TRIỂN (TIMELINE)', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildTimelineItem('2017', 'Đặt nền móng đầu tiên và xây dựng hạ tầng Block 1.'),
          _buildTimelineItem('2018', 'Những sản phẩm giày Decathlon đầu tiên được xuất xưởng thành công.'),
          _buildTimelineItem('2020', 'Áp dụng quản lý linh hoạt, số hóa các báo cáo giám sát trong đại dịch.'),
          _buildTimelineItem('2024-2025', 'Khởi động lộ trình chuyển đổi số toàn diện, xây dựng Digital Factory.'),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('[•] ', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 12)),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, fontFamily: 'monospace'),
                children: [
                  TextSpan(text: '$label: ', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  TextSpan(text: value),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(String year, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF06B6D4)),
            ),
            child: Text(year, style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.3)),
          ),
        ],
      ),
    );
  }
}

// 2. JOBS TAB
class GuestJobsTab extends StatefulWidget {
  const GuestJobsTab({Key? key}) : super(key: key);

  @override
  State<GuestJobsTab> createState() => _GuestJobsTabState();
}

class _GuestJobsTabState extends State<GuestJobsTab> {
  List<dynamic> _jobs = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
    setState(() => _isLoading = true);
    final list = await ApiService.fetchPublicJobs();
    setState(() {
      _jobs = list;
      _isLoading = false;
    });
  }

  void _showApplyDialog(int jobId, String jobTitle) {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final coverCtrl = TextEditingController();
    final cvCtrl = TextEditingController(text: 'https://cv.tbsgroup.vn/storage/candidate-cv.pdf');
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text('// ỨNG TUYỂN: $jobTitle', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'HỌ VÀ TÊN (*)')),
                    const SizedBox(height: 10),
                    TextField(controller: emailCtrl, decoration: const InputDecoration(labelText: 'EMAIL (*)')),
                    const SizedBox(height: 10),
                    TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'SỐ ĐIỆN THOẠI (*)')),
                    const SizedBox(height: 10),
                    TextField(controller: cvCtrl, decoration: const InputDecoration(labelText: 'LINK FILE CV (PDF/DOC)')),
                    const SizedBox(height: 10),
                    TextField(
                      controller: coverCtrl,
                      maxLines: 2,
                      decoration: const InputDecoration(labelText: 'THƯ GIỚI THIỆU / MÔ TẢ KINH NGHIỆM'),
                    ),
                  ],
                ),
              ),
              actions: [
                OutlinedButton(
                  onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
                  child: const Text('HỦY'),
                ),
                ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          if (nameCtrl.text.isEmpty || emailCtrl.text.isEmpty || phoneCtrl.text.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Vui lòng điền đủ thông tin bắt buộc (*)!'), backgroundColor: Colors.red),
                            );
                            return;
                          }
                          setDialogState(() => isSubmitting = true);
                          final success = await ApiService.applyJob(
                            jobId,
                            nameCtrl.text.trim(),
                            emailCtrl.text.trim(),
                            phoneCtrl.text.trim(),
                            cvCtrl.text.trim(),
                            coverCtrl.text.trim(),
                          );
                          setDialogState(() => isSubmitting = false);
                          Navigator.pop(ctx);
                          if (success) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Nộp đơn ứng tuyển thành công! Bộ phận nhân sự sẽ liên hệ sớm.'), backgroundColor: Colors.green),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Gửi ứng tuyển thất bại. Vui lòng thử lại!'), backgroundColor: Colors.red),
                            );
                          }
                        },
                  child: isSubmitting ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('NỘP HỒ SƠ'),
                )
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF06B6D4)));
    }

    if (_jobs.isEmpty) {
      return const Center(
        child: Text('Không có vị trí tuyển dụng nào hiện tại.', style: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'monospace')),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _jobs.length,
      itemBuilder: (ctx, idx) {
        final j = _jobs[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('[JOB-${j['id']}] ${j['title']}', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('ĐỊA ĐIỂM: ${j['location']}', style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11)),
                const SizedBox(height: 8),
                const Text('MÔ TẢ CÔNG VIỆC:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                Text(j['description'], style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.3)),
                const SizedBox(height: 8),
                const Text('YÊU CẦU ỨNG VIÊN:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                Text(j['requirements'], style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.3)),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 40,
                  child: ElevatedButton(
                    onPressed: () => _showApplyDialog(j['id'], j['title']),
                    child: const Text('ỨNG TUYỂN NGAY'),
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }
}

// 3. PROCESS TAB
class GuestProcessTab extends StatelessWidget {
  const GuestProcessTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('>>> QUY TRÌNH TUYỂN DỤNG 5 BƯỚC', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildProcessStep('BƯỚC 1', 'NỘP HỒ SƠ', 'Ứng viên gửi thông tin qua hệ thống di động hoặc nộp trực tiếp tại Văn Phòng Chuỗi SKECHERS.'),
          _buildProcessStep('BƯỚC 2', 'SÀNG LỌC', 'Bộ phận Nhân sự (HR) kiểm tra tính phù hợp của hồ sơ với các tiêu chuẩn vị trí.'),
          _buildProcessStep('BƯỚC 3', 'KIỂM TRA & PHỎNG VẤN', 'Đánh giá tay nghề thực tế tại xưởng (đối với công nhân may) hoặc phỏng vấn nghiệp vụ chuyên môn.'),
          _buildProcessStep('BƯỚC 4', 'THỎA THUẬN TUYỂN DỤNG', 'Thống nhất các điều khoản công việc, mức lương, phụ cấp và ký hợp đồng thử việc.'),
          _buildProcessStep('BƯỚC 5', 'HỘI NHẬP & ĐÀO TẠO', 'Tham gia khóa huấn luyện an toàn lao động, giới thiệu xưởng sản xuất và bắt đầu thử việc.'),
          const SizedBox(height: 20),
          const Divider(color: Color(0xFF1E293B)),
          const SizedBox(height: 16),
          const Text('>>> CÁC CÂU HỎI THƯỜNG GẶP (FAQ)', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildFAQItem(
            'Q: Công nhân chưa có tay nghề may có được nhận không?',
            'A: Có. Hệ thống có trung tâm đào tạo nghề riêng. Ứng viên chưa có kinh nghiệm sẽ được đào tạo nghề may miễn phí và hỗ trợ lương trong thời gian học nghề.',
          ),
          _buildFAQItem(
            'Q: Chế độ phúc lợi của nhà máy gồm những gì?',
            'A: Tham gia BHXH đầy đủ, hỗ trợ cơm trưa miễn phí tại nhà ăn xưởng, thưởng năng suất chuyền hàng tháng, lương tháng 13 và quà tết.',
          ),
        ],
      ),
    );
  }

  Widget _buildProcessStep(String step, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('$step: ', style: const TextStyle(color: Color(0xFF06B6D4), fontWeight: FontWeight.bold, fontSize: 12)),
              Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.only(left: 12.0),
            child: Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.3)),
          ),
        ],
      ),
    );
  }

  Widget _buildFAQItem(String question, String answer) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(question, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 4),
          Text(answer, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.3)),
        ],
      ),
    );
  }
}

// 4. CONTACT TAB
class GuestContactTab extends StatelessWidget {
  const GuestContactTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('>>> THÔNG TIN LIÊN HỆ', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildContactRow(Icons.location_on_outlined, 'ĐỊA CHỈ', 'Văn Phòng Chuỗi SKECHERS - TBS Group, Việt Nam'),
          _buildContactRow(Icons.phone_outlined, 'SỐ ĐIỆN THOẠI', '0296 3878 099'),
          _buildContactRow(Icons.email_outlined, 'EMAIL HỖ TRỢ', 'hr-skechers@tbsgroup.vn'),
          _buildContactRow(Icons.web_outlined, 'WEBSITE CHÍNH THỨC', 'https://www.tbsgroup.vn'),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF1E293B)),
              color: const Color(0xFF0D121F),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('// THỜI GIAN NHẬN HỒ SƠ TRỰC TIẾP:', style: TextStyle(color: Color(0xFF06B6D4), fontWeight: FontWeight.bold, fontSize: 11)),
                SizedBox(height: 8),
                Text('• Thứ Hai - Thứ Bảy: 08:00 - 17:00', style: TextStyle(color: Colors.white70, fontSize: 12)),
                Text('• Địa điểm: Cổng bảo vệ số 1 - Văn Phòng Chuỗi SKECHERS.', style: TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: const Color(0xFF06B6D4)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.3)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
