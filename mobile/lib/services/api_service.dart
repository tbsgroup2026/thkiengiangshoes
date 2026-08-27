import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8000/api/v1';

  static Future<Map<String, dynamic>?> login(String empCode, String password) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'emp_code': empCode, 'password': password}),
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('Login Exception: $e');
    }
    return null;
  }

  static Future<List<MachineModel>> fetchMachines() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/machines'));
      if (res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        return list.map((item) => MachineModel.fromJson(item)).toList();
      }
    } catch (e) {
      print('Fetch Machines Exception: $e');
    }
    return [];
  }

  static Future<MachineModel?> fetchMachineByCode(String code) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/machines/$code'));
      if (res.statusCode == 200) {
        return MachineModel.fromJson(jsonDecode(res.body));
      }
    } catch (e) {
      print('Fetch Machine Exception: $e');
    }
    return null;
  }

  static Future<List<IncidentModel>> fetchIncidents({String? status}) async {
    try {
      String url = '$baseUrl/incidents';
      if (status != null) url += '?status=$status';
      final res = await http.get(Uri.parse(url));
      if (res.statusCode == 200) {
        final List list = jsonDecode(res.body);
        return list.map((item) => IncidentModel.fromJson(item)).toList();
      }
    } catch (e) {
      print('Fetch Incidents Exception: $e');
    }
    return [];
  }

  static Future<bool> reportIncident(int machineId, String priority, String desc) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/incidents'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'machine_id': machineId,
          'priority': priority,
          'description': desc,
        }),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('Report Incident Exception: $e');
      return false;
    }
  }

  static Future<bool> acceptIncident(int incidentId, String token) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/incidents/$incidentId/accept'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return res.statusCode == 200;
    } catch (e) {
      print('Accept Incident Exception: $e');
      return false;
    }
  }

  static Future<bool> resolveIncident(
    int incidentId,
    String rootCause,
    String notes,
    String parts,
  ) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/incidents/$incidentId/resolve'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'incident_id': incidentId,
          'root_cause': rootCause,
          'resolution_notes': notes,
          'spare_parts_used': parts,
        }),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('Resolve Incident Exception: $e');
      return false;
    }
  }

  // --- NEW WORKFLOWS (RECRUITMENT, OFFICE DOCUMENTS, ORDERS) ---

  // 1. PUBLIC RECRUITMENT APIS
  static Future<List<dynamic>> fetchPublicJobs() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/jobs'));
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('Fetch Public Jobs Exception: $e');
    }
    return [];
  }

  static Future<bool> applyJob(
    int jobId,
    String name,
    String email,
    String phone,
    String cvUrl,
    String coverLetter,
  ) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/jobs/apply'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'job_id': jobId,
          'candidate_name': name,
          'candidate_email': email,
          'candidate_phone': phone,
          'cv_url': cvUrl,
          'cover_letter': coverLetter,
        }),
      );
      return res.statusCode == 201;
    } catch (e) {
      print('Apply Job Exception: $e');
      return false;
    }
  }

  // 2. OFFICE DOCUMENTS WORKFLOW APIS
  static Future<List<dynamic>> fetchOfficeDocs(String token) async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/office-docs'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('Fetch Office Docs Exception: $e');
    }
    return [];
  }

  static Future<bool> createOfficeDoc(String token, String docType, String title, String content) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/office-docs'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'doc_type': docType,
          'title': title,
          'content': content,
        }),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('Create Office Doc Exception: $e');
      return false;
    }
  }

  static Future<bool> approveOfficeDoc(String token, int docId, String status) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/office-docs/$docId/approve'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'status': status}),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('Approve Office Doc Exception: $e');
      return false;
    }
  }

  // 3. SUPPLY ORDERS APIS
  static Future<List<dynamic>> fetchSupplyOrders(String token) async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/orders'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('Fetch Supply Orders Exception: $e');
    }
    return [];
  }

  static Future<bool> createSupplyOrder(String token, List<Map<String, int>> items) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/orders'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'items': items.map((i) => {'part_id': i['part_id'], 'quantity': i['quantity']}).toList(),
        }),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('Create Supply Order Exception: $e');
      return false;
    }
  }

  static Future<bool> approveSupplyOrder(String token, int orderId, String status) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/orders/$orderId/approve'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'status': status}),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('Approve Supply Order Exception: $e');
      return false;
    }
  }

  static Future<bool> deliverSupplyOrder(String token, int orderId) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/orders/$orderId/deliver'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return res.statusCode == 200;
    } catch (e) {
      print('Deliver Supply Order Exception: $e');
      return false;
    }
  }
}
