import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class OfflineReport {
  final int machineId;
  final String machineCode;
  final String machineName;
  final String priority;
  final String description;
  final DateTime timestamp;

  OfflineReport({
    required this.machineId,
    required this.machineCode,
    required this.machineName,
    required this.priority,
    required this.description,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'machine_id': machineId,
        'machine_code': machineCode,
        'machine_name': machineName,
        'priority': priority,
        'description': description,
        'timestamp': timestamp.toIso8601String(),
      };

  factory OfflineReport.fromJson(Map<String, dynamic> json) => OfflineReport(
        machineId: json['machine_id'],
        machineCode: json['machine_code'],
        machineName: json['machine_name'],
        priority: json['priority'],
        description: json['description'],
        timestamp: DateTime.parse(json['timestamp']),
      );
}

class OfflineQueue {
  static const String _storageKey = 'tbs2_offline_reports';

  static Future<void> queueReport({
    required int machineId,
    required String machineCode,
    required String machineName,
    required String priority,
    required String description,
  }) async {
    final report = OfflineReport(
      machineId: machineId,
      machineCode: machineCode,
      machineName: machineName,
      priority: priority,
      description: description,
      timestamp: DateTime.now(),
    );

    final prefs = await SharedPreferences.getInstance();
    final List<String> currentList = prefs.getStringList(_storageKey) ?? [];
    
    currentList.add(jsonEncode(report.toJson()));
    await prefs.setStringList(_storageKey, currentList);
    print('[TBS II OFFLINE] Report for $machineCode queued locally. Total: ${currentList.length}');
  }

  static Future<List<OfflineReport>> getQueuedReports() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String>? currentList = prefs.getStringList(_storageKey);
    if (currentList == null) return [];
    
    try {
      return currentList.map((item) => OfflineReport.fromJson(jsonDecode(item))).toList();
    } catch (e) {
      print('Error parsing offline queue: $e');
      return [];
    }
  }

  static Future<int> syncQueue() async {
    final reports = await getQueuedReports();
    if (reports.isEmpty) return 0;

    print('[TBS II OFFLINE] Attempting to sync ${reports.length} reports...');
    int successCount = 0;
    final List<OfflineReport> failedToSync = [];

    for (final report in reports) {
      final success = await ApiService.reportIncident(
        report.machineId,
        report.priority,
        report.description,
      );
      if (success) {
        successCount++;
        print('[TBS II OFFLINE] Synced report for ${report.machineCode} successfully.');
      } else {
        failedToSync.add(report);
        print('[TBS II OFFLINE] Sync failed for ${report.machineCode}. Retrying later.');
      }
    }

    final prefs = await SharedPreferences.getInstance();
    if (failedToSync.isEmpty) {
      await prefs.remove(_storageKey);
    } else {
      await prefs.setStringList(
        _storageKey,
        failedToSync.map((r) => jsonEncode(r.toJson())).toList(),
      );
    }

    return successCount;
  }
}
