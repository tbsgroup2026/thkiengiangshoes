import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/offline_queue.dart';

class WorkerScreen extends StatefulWidget {
  final UserModel user;
  const WorkerScreen({Key? key, required this.user}) : super(key: key);

  @override
  State<WorkerScreen> createState() => _WorkerScreenState();
}

class _WorkerScreenState extends State<WorkerScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Tab 1: Machine Report States
  final TextEditingController _qrCodeController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  MachineModel? _selectedMachine;
  String _selectedPriority = 'HIGH';
  List<IncidentModel> _myIncidents = [];
  List<OfflineReport> _offlineReports = [];
  bool _isLoading = false;

  // Tab 2: Office Docs States
  List<dynamic> _myDocs = [];

  // Tab 3: Supply Orders States
  List<dynamic> _myOrders = [];
  List<SparePartModel> _availableParts = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAllData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllData() async {
    setState(() => _isLoading = true);
    await _loadMyIncidents();
    await _loadOfflineReports();
    await _loadOfficeDocs();
    await _loadSupplyOrders();
    await _loadAvailableParts();
    setState(() => _isLoading = false);
  }

  // --- TAB 1 LOGIC: INCIDENT REPORTS ---
  Future<void> _loadMyIncidents() async {
    final list = await ApiService.fetchIncidents();
    setState(() {
      _myIncidents = list;
    });
  }

  Future<void> _loadOfflineReports() async {
    final list = await OfflineQueue.getQueuedReports();
    setState(() {
      _offlineReports = list;
    });
  }

  Future<void> _searchMachine() async {
    if (_qrCodeController.text.trim().isEmpty) return;
    final machine = await ApiService.fetchMachineByCode(_qrCodeController.text.trim());
    setState(() {
      _selectedMachine = machine;
    });

    if (machine == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('ERR: Không tìm thấy mã máy này!', style: TextStyle(fontFamily: 'monospace')),
          backgroundColor: Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _submitReport() async {
    if (_selectedMachine == null) return;
    if (_descController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('ERR: Vui lòng nhập mô tả sự cố!', style: TextStyle(fontFamily: 'monospace')),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    // Attempt online submission
    final success = await ApiService.reportIncident(
      _selectedMachine!.id,
      _selectedPriority,
      _descController.text.trim(),
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('SYS_ALERT: Báo sự cố máy ${_selectedMachine!.machineCode} thành công!', style: const TextStyle(fontFamily: 'monospace')),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
      _descController.clear();
      setState(() => _selectedMachine = null);
      await _loadMyIncidents();
    } else {
      // Offline fallback: Queue locally
      await OfflineQueue.queueReport(
        machineId: _selectedMachine!.id,
        machineCode: _selectedMachine!.machineCode,
        machineName: _selectedMachine!.name,
        priority: _selectedPriority,
        description: _descController.text.trim(),
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('OFFLINE_MODE: Không có mạng. Sự cố đã lưu vào hàng đợi cục bộ.', style: TextStyle(fontFamily: 'monospace')),
          backgroundColor: Color(0xFFF59E0B),
        ),
      );
      _descController.clear();
      setState(() => _selectedMachine = null);
      await _loadOfflineReports();
    }
    setState(() => _isLoading = false);
  }

  Future<void> _syncOfflineQueue() async {
    setState(() => _isLoading = true);
    final synced = await OfflineQueue.syncQueue();
    setState(() => _isLoading = false);
    
    if (synced > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('SYS_SYNC: Đã đồng bộ thành công $synced sự cố lên hệ thống!', style: const TextStyle(fontFamily: 'monospace')),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
      await _loadMyIncidents();
      await _loadOfflineReports();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('SYS_SYNC_ERR: Không có sự cố nào được đồng bộ. Kiểm tra lại kết nối mạng!', style: TextStyle(fontFamily: 'monospace')),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
    }
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

  // --- TAB 3 LOGIC: SUPPLY ORDERS ---
  Future<void> _loadSupplyOrders() async {
    final list = await ApiService.fetchSupplyOrders('demo_token');
    setState(() {
      _myOrders = list;
    });
  }

  Future<void> _loadAvailableParts() async {
    setState(() {
      _availableParts = [
        SparePartModel(id: 1, partCode: 'SP-KIM-01', name: 'Kim máy may Juki #14', unit: 'Hộp', stockQty: 120, minQty: 20, unitCost: 45000),
        SparePartModel(id: 2, partCode: 'SP-BO-02', name: 'Bo mạch điều khiển Brother S-7', unit: 'Cái', stockQty: 3, minQty: 1, unitCost: 3200000),
        SparePartModel(id: 3, partCode: 'SP-VAN-03', name: 'Van khí nén SMC 24V', unit: 'Cái', stockQty: 15, minQty: 5, unitCost: 450000),
      ];
    });
  }

  void _showCreateOrderDialog() {
    int selectedPartId = _availableParts.isNotEmpty ? _availableParts[0].id : 1;
    final qtyCtrl = TextEditingController(text: '1');

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('// ĐẶT VẬT TƯ MỚI', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('CHỌN VẬT TƯ/LINH KIỆN:', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                  DropdownButton<int>(
                    value: selectedPartId,
                    dropdownColor: const Color(0xFF121829),
                    isExpanded: true,
                    style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 12),
                    items: _availableParts.map((p) {
                      return DropdownMenuItem(value: p.id, child: Text('${p.partCode} - ${p.name}'));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setDialogState(() => selectedPartId = val);
                    },
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: qtyCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'SỐ LƯỢNG YÊU CẦU'),
                  ),
                ],
              ),
              actions: [
                OutlinedButton(onPressed: () => Navigator.pop(ctx), child: const Text('HỦY')),
                ElevatedButton(
                  onPressed: () async {
                    final qty = int.tryParse(qtyCtrl.text) ?? 1;
                    final items = [
                      {'part_id': selectedPartId, 'quantity': qty}
                    ];
                    final success = await ApiService.createSupplyOrder('demo_token', items);
                    Navigator.pop(ctx);
                    if (success) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Tạo đơn đặt hàng vật tư thành công!'), backgroundColor: Color(0xFF10B981)),
                      );
                      _loadSupplyOrders();
                    }
                  },
                  child: const Text('ĐẶT HÀNG'),
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
      case 'SUBMITTED':
        return const Color(0xFFEF4444);
      case 'IN_PROGRESS':
      case 'REVIEWING':
      case 'APPROVED':
        return const Color(0xFF3B82F6);
      case 'RESOLVED':
      case 'DELIVERED':
        return const Color(0xFF10B981);
      default:
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('>>> TBS // WORKER_${widget.user.empCode}'),
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
            Tab(text: 'BÁO HỎNG', icon: Icon(Icons.warning_amber_rounded, size: 18)),
            Tab(text: 'VĂN PHÒNG', icon: Icon(Icons.edit_document, size: 18)),
            Tab(text: 'VẬT TƯ', icon: Icon(Icons.shopping_cart_outlined, size: 18)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildIncidentTab(),
          _buildOfficeDocsTab(),
          _buildSupplyOrdersTab(),
        ],
      ),
    );
  }

  // --- BUILD TAB 1 ---
  Widget _buildIncidentTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Offline Status Banner
          if (_offlineReports.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withOpacity(0.08),
                border: Border.all(color: const Color(0xFFF59E0B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'CẢNH BÁO: Có ${_offlineReports.length} sự cố chưa đồng bộ.',
                      style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: _syncOfflineQueue,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFF59E0B),
                      side: const BorderSide(color: Color(0xFFF59E0B)),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                    ),
                    child: const Text('ĐỒNG BỘ NGAY', style: TextStyle(fontSize: 10)),
                  ),
                ],
              ),
            ),

          // Scan / Enter QR Code Machine Lookup
          const Text('>>> THIẾT BỊ QR CODE ENTRY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _qrCodeController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(
                    hintText: 'VD: TBS2-MCH-001',
                    prefixIcon: Icon(Icons.qr_code_scanner, color: Color(0xFF06B6D4)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                height: 48,
                child: OutlinedButton(
                  onPressed: _searchMachine,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF06B6D4)),
                    foregroundColor: const Color(0xFF06B6D4),
                  ),
                  child: const Text('TÌM MÁY', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Machine Info & Incident Form
          if (_selectedMachine != null) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0D121F),
                border: Border.all(color: const Color(0xFFF59E0B), width: 1),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('[${_selectedMachine!.machineCode}]', style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getStatusColor(_selectedMachine!.status).withOpacity(0.08),
                          border: Border.all(color: _getStatusColor(_selectedMachine!.status)),
                        ),
                        child: Text(
                          _selectedMachine!.status,
                          style: TextStyle(color: _getStatusColor(_selectedMachine!.status), fontWeight: FontWeight.bold, fontSize: 10),
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(_selectedMachine!.name, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                  const SizedBox(height: 16),

                  const Text('// MỨC ĐỘ ƯU TIÊN SỰ CỐ', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold, fontSize: 10)),
                  DropdownButton<String>(
                    value: _selectedPriority,
                    dropdownColor: const Color(0xFF0D121F),
                    isExpanded: true,
                    style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 12),
                    underline: Container(
                      height: 1,
                      color: const Color(0xFF1E293B),
                    ),
                    items: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) {
                      return DropdownMenuItem(value: p, child: Text(p));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedPriority = val);
                    },
                  ),

                  const SizedBox(height: 16),
                  TextField(
                    controller: _descController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Mô tả chi tiết sự cố (tiếng động lạ, hỏng motor, kẹt kim...)',
                    ),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: _isLoading ? null : _submitReport,
                      icon: const Icon(Icons.warning_amber_rounded, color: Colors.black, size: 16),
                      label: const Text('GỬI BÁO HỎNG & BẮN CẢNH BÁO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEF4444),
                        foregroundColor: Colors.black,
                      ),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Incident History List
          const Text('>>> NHẬT KÝ BÁO HỎNG GẦN ĐÂY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 10),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _myIncidents.length,
            itemBuilder: (ctx, idx) {
              final inc = _myIncidents[idx];
              final statusColor = _getStatusColor(inc.status);
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  title: Text(
                    '${inc.incidentCode} // [${inc.machineCode}]',
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Text(inc.description, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.08),
                      border: Border.all(color: statusColor),
                    ),
                    child: Text(
                      inc.status,
                      style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              );
            },
          )
        ],
      ),
    );
  }

  // --- BUILD TAB 2 ---
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

  // --- BUILD TAB 3 ---
  Widget _buildSupplyOrdersTab() {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateOrderDialog,
        backgroundColor: const Color(0xFF06B6D4),
        foregroundColor: Colors.black,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        child: const Icon(Icons.add),
      ),
      body: _myOrders.isEmpty
          ? const Center(
              child: Text('Không có đơn hàng vật tư nào.', style: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'monospace', fontSize: 11)),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _myOrders.length,
              itemBuilder: (ctx, idx) {
                final order = _myOrders[idx];
                final statusColor = _getStatusColor(order['status']);
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
                              order['order_code'],
                              style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: statusColor.withOpacity(0.08),
                                border: Border.all(color: statusColor),
                              ),
                              child: Text(
                                order['status'],
                                style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 8),
                        // List items ordered
                        ... (order['items'] as List).map((it) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 4.0),
                            child: Text(
                              '• ${it['part_code']} - ${it['part_name']} [SL: ${it['quantity']}]',
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          );
                        }).toList(),
                        const SizedBox(height: 6),
                        const Divider(color: Color(0xFF1E293B)),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'NGÀY ĐẶT: ${order['created_at'].toString().substring(0,10)}',
                              style: const TextStyle(color: Color(0xFF475569), fontSize: 10),
                            ),
                            Text(
                              'CHI PHÍ: ${order['total_cost'].toString()} VNĐ',
                              style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
