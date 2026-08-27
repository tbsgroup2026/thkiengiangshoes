class UserModel {
  final int id;
  final String empCode;
  final String name;
  final String role;
  final String? department;

  UserModel({
    required this.id,
    required this.empCode,
    required this.name,
    required this.role,
    this.department,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      empCode: json['emp_code'],
      name: json['name'],
      role: json['role'],
      department: json['department'],
    );
  }
}

class MachineModel {
  final int id;
  final String machineCode;
  final String name;
  final String status;
  final String? zoneName;
  final String? lineName;
  final String? qrCodeData;

  MachineModel({
    required this.id,
    required this.machineCode,
    required this.name,
    required this.status,
    this.zoneName,
    this.lineName,
    this.qrCodeData,
  });

  factory MachineModel.fromJson(Map<String, dynamic> json) {
    return MachineModel(
      id: json['id'],
      machineCode: json['machine_code'],
      name: json['name'],
      status: json['status'],
      zoneName: json['zone_name'],
      lineName: json['line_name'],
      qrCodeData: json['qr_code_data'],
    );
  }
}

class IncidentModel {
  final int id;
  final String incidentCode;
  final int machineId;
  final String machineCode;
  final String machineName;
  final String priority;
  final String status;
  final String description;
  final String reporterName;
  final String? assigneeName;
  final String createdAt;
  final int totalDowntimeSec;
  final int responseTimeSec;

  IncidentModel({
    required this.id,
    required this.incidentCode,
    required this.machineId,
    required this.machineCode,
    required this.machineName,
    required this.priority,
    required this.status,
    required this.description,
    required this.reporterName,
    this.assigneeName,
    required this.createdAt,
    required this.totalDowntimeSec,
    required this.responseTimeSec,
  });

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    return IncidentModel(
      id: json['id'],
      incidentCode: json['incident_code'] ?? '',
      machineId: json['machine_id'],
      machineCode: json['machine_code'] ?? '',
      machineName: json['machine_name'] ?? '',
      priority: json['priority'] ?? 'MEDIUM',
      status: json['status'] ?? 'OPEN',
      description: json['description'] ?? '',
      reporterName: json['reporter_name'] ?? 'Công nhân',
      assigneeName: json['assignee_name'],
      createdAt: json['created_at'] ?? '',
      totalDowntimeSec: json['total_downtime_sec'] ?? 0,
      responseTimeSec: json['response_time_sec'] ?? 0,
    );
  }
}

class SparePartModel {
  final int id;
  final String partCode;
  final String name;
  final String unit;
  final int stockQty;
  final int minQty;
  final double unitCost;

  SparePartModel({
    required this.id,
    required this.partCode,
    required this.name,
    required this.unit,
    required this.stockQty,
    required this.minQty,
    required this.unitCost,
  });

  factory SparePartModel.fromJson(Map<String, dynamic> json) {
    return SparePartModel(
      id: json['id'],
      partCode: json['part_code'] ?? '',
      name: json['name'] ?? '',
      unit: json['unit'] ?? 'Cái',
      stockQty: json['stock_qty'] ?? 0,
      minQty: json['min_qty'] ?? 0,
      unitCost: (json['unit_cost'] ?? 0.0).toDouble(),
    );
  }
}
