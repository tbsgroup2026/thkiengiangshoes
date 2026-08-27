import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class MaintenanceScreen extends StatefulWidget {
  final UserModel user;
  const MaintenanceScreen({Key? key, required this.user}) : super(key: key);

  @override
  State<MaintenanceScreen> createState() => _MaintenanceScreenState();
}

class _MaintenanceScreenState extends State<MaintenanceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Tab 1: Incidents States
  List<IncidentModel> _incidents = [];
  bool _isLoading = false;

  // Tab 2: Office Docs States
  List<dynamic> _myDocs = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadAllData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllData() async {
    setState(() => _isLoading = true);
    await _loadIncidents();
    await _loadOfficeDocs();
    setState(() => _isLoading = false);
  }

  // --- TAB 1 LOGIC: INCIDENTS ---
  Future<void> _loadIncidents() async {
    final list = await ApiService.fetchIncidents();
    setState(() {
      _incidents = list;
    });
  }

  Future<void> _acceptTask(IncidentModel inc) async {
    setState(() => _isLoading = true);
    final success = await ApiService.acceptIncident(inc.id, 'demo_token');
    setState(() => _isLoading = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('SYS_ALERT: Đã nhận ca sửa chữa ${inc.incidentCode}! Đồng hồ tính SLA hoạt động.', style: const TextStyle(fontFamily: 'monospace')),
          backgroundColor: const Color(0xFF3B82F6),
          behavior: SnackBarBehavior.floating,
        ),
      );
      _loadIncidents();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('ERR: Không thể nhận ca. Thử lại!', style: TextStyle(fontFamily: 'monospace')),
          backgroundColor: Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _showResolveDialog(IncidentModel inc) {
    final rootCauseCtrl = TextEditingController(text: 'Chập cầu chì nguồn cấp / Hỏng nút nhấn');
    final notesCtrl = TextEditingController(text: 'Đã thay cầu chì mới 10A và vệ sinh tiếp điểm');
    final partsCtrl = TextEditingController(text: 'Cầu chì 10A (1 cái)');

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Text('// XÁC NHẬN HOÀN TẤT ${inc.incidentCode}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 8),
                TextField(
                  controller: rootCauseCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(labelText: 'NGUYÊN NHÂN LỖI (*)'),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: notesCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(labelText: 'HƯỚNG XỬ LÝ (*)'),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: partsCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(labelText: 'LINH KIỆN THAY THẾ'),
                ),
              ],
            ),
          ),
          actions: [
            OutlinedButton(
              onPressed: () => Navigator.pop(ctx),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF94A3B8),
                side: const BorderSide(color: Color(0xFF1E293B)),
              ),
              child: const Text('HỦY'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                final success = await ApiService.resolveIncident(
                  inc.id,
                  rootCauseCtrl.text.trim(),
                  notesCtrl.text.trim(),
                  partsCtrl.text.trim(),
                );
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('SYS_ALERT: Đã hoàn tất sửa chữa. Trạng thái máy đã khôi phục!', style: TextStyle(fontFamily: 'monospace')),
                      backgroundColor: Color(0xFF10B981),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                  _loadIncidents();
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
              child: const Text('XÁC NHẬN SỬA XONG'),
            )
          ],
        );
      },
    );
  }

  // --- TAB 2 LOGIC: OFFICE DOCUMENTS ---
  Future<void> _loadOfficeDocs() async {
    final list = await ApiService.fetchOfficeDocs('demo_token');
    setState(() {
      _myDocs = list;
    });
  }

  void _showCreateDocDialog() {
    String selectedType = 'LEAVE';
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('// GIẤY TỜ NỘI BỘ MỚI', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('LOẠI ĐƠN TỪ:', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                    DropdownButton<String>(
                      value: selectedType,
                      dropdownColor: const Color(0xFF121829),
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 13),
                      items: const [
                        DropdownMenuItem(value: 'LEAVE', child: Text('ĐƠN XIN NGHỈ PHÉP')),
                        DropdownMenuItem(value: 'PROPOSAL', child: Text('ĐỀ XUẤT CẢI TIẾN')),
                        DropdownMenuItem(value: 'BUSINESS_TRIP', child: Text('ĐƠN CÔNG TÁC')),
                      ],
                      onChanged: (val) {
                        if (val != null) setDialogState(() => selectedType = val);
                      },
                    ),
                    const SizedBox(height: 10),
                    TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'TIÊU ĐỀ (*)')),
                    const SizedBox(height: 10),
                    TextField(
                      controller: contentCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(labelText: 'MÔ TẢ CHI TIẾT NỘI DUNG (*)'),
                    ),
                  ],
                ),
              ),
              actions: [
                OutlinedButton(onPressed: () => Navigator.pop(ctx), child: const Text('HỦY')),
                ElevatedButton(
                  onPressed: () async {
                    if (titleCtrl.text.isEmpty || contentCtrl.text.isEmpty) return;
                    final success = await ApiService.createOfficeDoc('demo_token', selectedType, titleCtrl.text.trim(), contentCtrl.text.trim());
                    Navigator.pop(ctx);
                    if (success) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Đã gửi đơn trình duyệt thành công!'), backgroundColor: Color(0xFF10B981)),
                      );
                      _loadOfficeDocs();
                    }
                  },
                  child: const Text('GỬI ĐƠN'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
      case 'OPEN':
        return const Color(0xFFEF4444);
      case 'IN_PROGRESS':
      case 'APPROVED':
        return const Color(0xFF3B82F6);
      case 'RESOLVED':
      case 'DELIVERED':
        return const Color(0xFF10B981);
      default:
        return Colors.white;
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'CRITICAL':
        return const Color(0xFFEF4444);
      case 'HIGH':
        return const Color(0xFFF97316);
      case 'MEDIUM':
        return const Color(0xFFF59E0B);
      case 'LOW':
        return const Color(0xFF84CC16);
      default:
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('>>> TBS // MAINT_${widget.user.empCode}'),
        actions: [
          IconButton(onPressed: _loadAllData, icon: const Icon(Icons.refresh))
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF06B6D4),
          labelColor: const Color(0xFF06B6D4),
          unselectedLabelColor: const Color(0xFF94A3B8),
          labelStyle: const TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: 'NHIỆM VỤ', icon: Icon(Icons.engineering, size: 18)),
            Tab(text: 'VĂN PHÒNG', icon: Icon(Icons.edit_document, size: 18)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildIncidentsTab(),
          _buildOfficeDocsTab(),
        ],
      ),
    );
  }

  Widget _buildIncidentsTab() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF06B6D4)));
    }
    return RefreshIndicator(
      onRefresh: _loadIncidents,
      color: const Color(0xFF06B6D4),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _incidents.length,
        itemBuilder: (ctx, idx) {
          final inc = _incidents[idx];
          final isPending = inc.status == 'OPEN';
          final isInProgress = inc.status == 'IN_PROGRESS';
          final isResolved = inc.status == 'RESOLVED';
          final statusColor = _getStatusColor(inc.status);
          final priorityColor = _getPriorityColor(inc.priority);

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0D121F),
              border: Border.all(
                color: statusColor,
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(inc.incidentCode, style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 15, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: priorityColor.withOpacity(0.08),
                        border: Border.all(color: priorityColor),
                      ),
                      child: Text(
                        inc.priority,
                        style: TextStyle(color: priorityColor, fontWeight: FontWeight.bold, fontSize: 10),
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 10),
                Text('MÁY: [${inc.machineCode}] (${inc.machineName})', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text('NGƯỜI BÁO: ${inc.reporterName}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                const SizedBox(height: 8),
                const Divider(color: Color(0xFF1E293B)),
                const SizedBox(height: 8),
                Text(inc.description, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 16),

                if (isPending)
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: () => _acceptTask(inc),
                      icon: const Icon(Icons.play_arrow, size: 16),
                      label: const Text('NHẬN NHIỆM VỤ (TÍNH SLA)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF3B82F6),
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),

                if (isInProgress)
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: () => _showResolveDialog(inc),
                      icon: const Icon(Icons.check_circle_outline, size: 16),
                      label: const Text('XÁC NHẬN HOÀN TẤT SỬA CHỮA'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.black,
                      ),
                    ),
                  ),

                if (isResolved)
                  Row(
                    children: const [
                      Icon(Icons.check_circle, color: Color(0xFF10B981), size: 18),
                      SizedBox(width: 8),
                      Text(
                        'SỬA XONG // ĐÃ ĐỒNG BỘ DỮ LIỆU BI',
                        style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ],
                  )
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildOfficeDocsTab() {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDocDialog,
        backgroundColor: const Color(0xFF06B6D4),
        foregroundColor: Colors.black,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        child: const Icon(Icons.add),
      ),
      body: _myDocs.isEmpty
          ? const Center(
              child: Text('Không có đơn xin phép/đề xuất nào.', style: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'monospace', fontSize: 11)),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _myDocs.length,
              itemBuilder: (ctx, idx) {
                final doc = _myDocs[idx];
                final statusColor = _getStatusColor(doc['status']);
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(14.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '// TYPE: ${doc['doc_type']}',
                              style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: statusColor.withOpacity(0.08),
                                border: Border.all(color: statusColor),
                              ),
                              child: Text(
                                doc['status'],
                                style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(doc['title'], style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(doc['content'], style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.3)),
                        if (doc['approver_name'] != null) ...[
                          const SizedBox(height: 8),
                          const Divider(color: Color(0xFF1E293B)),
                          const SizedBox(height: 4),
                          Text(
                            'NGƯỜI DUYỆT: ${doc['approver_name']}',
                            style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ]
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
