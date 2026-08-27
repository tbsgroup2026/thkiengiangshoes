import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class ManagerScreen extends StatefulWidget {
  final UserModel user;
  const ManagerScreen({Key? key, required this.user}) : super(key: key);

  @override
  State<ManagerScreen> createState() => _ManagerScreenState();
}

class _ManagerScreenState extends State<ManagerScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;

  // Tab 1: BI Stats
  int operatingMachines = 0;
  int downMachines = 0;
  int activeIncidents = 0;

  // Tab 2: Office Documents Approval
  List<dynamic> _allDocs = [];

  // Tab 3: Supply Orders Approval
  List<dynamic> _allOrders = [];

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
    await _loadStats();
    await _loadOfficeDocs();
    await _loadSupplyOrders();
    setState(() => _isLoading = false);
  }

  Future<void> _loadStats() async {
    final machines = await ApiService.fetchMachines();
    final incidents = await ApiService.fetchIncidents();
    setState(() {
      operatingMachines = machines.where((m) => m.status == 'OPERATING').length;
      downMachines = machines.where((m) => m.status == 'DOWN').length;
      activeIncidents = incidents.where((i) => i.status != 'RESOLVED').length;
    });
  }

  Future<void> _loadOfficeDocs() async {
    final list = await ApiService.fetchOfficeDocs('demo_token');
    setState(() {
      _allDocs = list;
    });
  }

  Future<void> _loadSupplyOrders() async {
    final list = await ApiService.fetchSupplyOrders('demo_token');
    setState(() {
      _allOrders = list;
    });
  }

  Future<void> _handleDocApproval(int docId, String status) async {
    setState(() => _isLoading = true);
    final success = await ApiService.approveOfficeDoc('demo_token', docId, status);
    setState(() => _isLoading = false);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('SYS_ALERT: Đã cập nhật trạng thái đơn từ thành $status!'), backgroundColor: const Color(0xFF10B981)),
      );
      _loadOfficeDocs();
    }
  }

  Future<void> _handleOrderApproval(int orderId, String status) async {
    setState(() => _isLoading = true);
    final success = await ApiService.approveSupplyOrder('demo_token', orderId, status);
    setState(() => _isLoading = false);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('SYS_ALERT: Đã cập nhật trạng thái đơn hàng thành $status!'), backgroundColor: const Color(0xFF10B981)),
      );
      _loadSupplyOrders();
    }
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('>>> TBS II - MANAGEMENT PORTAL'),
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
            Tab(text: 'BI STATS', icon: Icon(Icons.bar_chart, size: 18)),
            Tab(text: 'DUYỆT ĐƠN TỪ', icon: Icon(Icons.rule, size: 18)),
            Tab(text: 'DUYỆT VẬT TƯ', icon: Icon(Icons.fact_check, size: 18)),
          ],
        ),
      ),
      body: Column(
        children: [
          if (_isLoading) const LinearProgressIndicator(color: Color(0xFF06B6D4)),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildBIStatsTab(),
                _buildApproveDocsTab(),
                _buildApproveOrdersTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBIStatsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('CHÀO GIÁM ĐỐC, ${widget.user.name.toUpperCase()}', style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          const Text('SYS_STATUS: Tổng quan tình hình vận hành xưởng TBS II', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
          const SizedBox(height: 20),

          // KPI Grid Cards
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D121F),
                    border: Border.all(color: const Color(0xFF10B981)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('MÁY ĐANG CHẠY', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text('$operatingMachines', style: const TextStyle(color: Color(0xFF10B981), fontSize: 24, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D121F),
                    border: Border.all(color: const Color(0xFFEF4444)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('MÁY ĐANG DỪNG', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text('$downMachines', style: const TextStyle(color: Color(0xFFEF4444), fontSize: 24, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Additional BI Metrics
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D121F),
                    border: Border.all(color: const Color(0xFF06B6D4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('TỶ LỆ ĐẠT SLA', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('94.8 %', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 22, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D121F),
                    border: Border.all(color: const Color(0xFFF59E0B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('THỜI GIAN MTTR', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('24.5 phút', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 22, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),

          // Major Repair Budget Approvals Section
          const Text('>>> MOCK: PHÊ DUYỆT CHI PHÍ SỬA CHỮA LỚN (> 5.0M VNĐ)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0D121F),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('[MCH-003] Máy Cắt Lectra', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    Text('18,500,000đ', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('MÔ TẢ: Thay thế bo mạch CPU chính & màn hình cảm ứng HMI điều khiển', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('SYS_ALERT: Đã từ chối đề xuất chi phí!'), backgroundColor: Color(0xFFEF4444)),
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFEF4444)),
                          foregroundColor: const Color(0xFFEF4444),
                        ),
                        child: const Text('TỪ CHỐI'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('SYS_ALERT: Đã phê duyệt đề xuất chi phí 18.5M VNĐ!'), backgroundColor: Color(0xFF10B981)),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.black,
                        ),
                        child: const Text('PHÊ DUYỆT'),
                      ),
                    ),
                  ],
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildApproveDocsTab() {
    final pendingDocs = _allDocs.where((d) => d['status'] == 'PENDING').toList();
    if (pendingDocs.isEmpty) {
      return const Center(child: Text('Không có đơn từ nào chờ phê duyệt.', style: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'monospace', fontSize: 11)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: pendingDocs.length,
      itemBuilder: (ctx, idx) {
        final doc = pendingDocs[idx];
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
                    Text('// TYPE: ${doc['doc_type']}', style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 10, fontWeight: FontWeight.bold)),
                    Text('NGƯỜI GỬI: ${doc['creator_name']}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(doc['title'], style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(doc['content'], style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.3)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _handleDocApproval(doc['id'], 'REJECTED'),
                        style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFEF4444)), foregroundColor: const Color(0xFFEF4444)),
                        child: const Text('TỪ CHỐI'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => _handleDocApproval(doc['id'], 'APPROVED'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.black),
                        child: const Text('PHÊ DUYỆT'),
                      ),
                    )
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildApproveOrdersTab() {
    final pendingOrders = _allOrders.where((o) => o['status'] == 'PENDING').toList();
    if (pendingOrders.isEmpty) {
      return const Center(child: Text('Không có đơn đặt vật tư nào chờ phê duyệt.', style: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'monospace', fontSize: 11)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: pendingOrders.length,
      itemBuilder: (ctx, idx) {
        final order = pendingOrders[idx];
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
                    Text(order['order_code'], style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold)),
                    Text('NGƯỜI ĐẶT: ${order['creator_name']}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 8),
                ... (order['items'] as List).map((it) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4.0),
                    child: Text('• ${it['part_code']} - ${it['part_name']} [SL: ${it['quantity']}]', style: const TextStyle(color: Colors.white, fontSize: 12)),
                  );
                }).toList(),
                const SizedBox(height: 6),
                const Divider(color: Color(0xFF1E293B)),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('CHI PHÍ: ${order['total_cost']} VNĐ', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _handleOrderApproval(order['id'], 'REJECTED'),
                        style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFEF4444)), foregroundColor: const Color(0xFFEF4444)),
                        child: const Text('TỪ CHỐI'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => _handleOrderApproval(order['id'], 'APPROVED'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.black),
                        child: const Text('PHÊ DUYỆT'),
                      ),
                    )
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
