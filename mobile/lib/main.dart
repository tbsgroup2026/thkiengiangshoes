import 'package:flutter/material.dart';
import 'models/models.dart';
import 'services/api_service.dart';
import 'screens/worker_screen.dart';
import 'screens/maintenance_screen.dart';
import 'screens/manager_screen.dart';

import 'screens/guest_screens.dart';

void main() {
  runApp(const TBS2MobileApp());
}

class TBS2MobileApp extends StatelessWidget {
  const TBS2MobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TBS II Mobile App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFF06B6D4),
        scaffoldBackgroundColor: const Color(0xFF07090E),
        cardColor: const Color(0xFF121829),
        // Force Monospace Typography globally
        textTheme: ThemeData.dark().textTheme.apply(
              fontFamily: 'monospace',
            ),
        primaryTextTheme: ThemeData.dark().primaryTextTheme.apply(
              fontFamily: 'monospace',
            ),
        // Mechanical sharp corners configuration globally
        cardTheme: const CardThemeData(
          color: Color(0xFF121829),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
            side: BorderSide(color: Color(0xFF1E293B)),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF06B6D4),
            foregroundColor: Colors.black,
            elevation: 0,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.zero,
            ),
            textStyle: const TextStyle(
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Color(0xFF1E293B)),
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.zero,
            ),
            textStyle: const TextStyle(
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
        ),
        inputDecorationTheme: const InputDecorationTheme(
          filled: true,
          fillColor: Color(0xFF0D121F),
          labelStyle: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'monospace'),
          hintStyle: TextStyle(color: Color(0xFF475569), fontFamily: 'monospace'),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.zero,
            borderSide: BorderSide(color: Color(0xFF1E293B)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.zero,
            borderSide: BorderSide(color: Color(0xFF1E293B)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.zero,
            borderSide: BorderSide(color: Color(0xFF06B6D4)),
          ),
        ),
        dialogTheme: const DialogThemeData(
          backgroundColor: Color(0xFF121829),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
            side: BorderSide(color: Color(0xFF1E293B)),
          ),
        ),
        chipTheme: const ChipThemeData(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
          ),
          backgroundColor: Color(0xFF121829),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0D121F),
          elevation: 0,
          titleTextStyle: TextStyle(
            color: Color(0xFFF8FAFC),
            fontSize: 16,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
      ),
      home: const LoginScreen(),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _empCodeController = TextEditingController(text: 'CN001');
  final TextEditingController _passwordController = TextEditingController(text: '123456');
  bool _isLoading = false;
  bool _showGuestPortal = false;

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    final data = await ApiService.login(_empCodeController.text.trim(), _passwordController.text.trim());
    setState(() => _isLoading = false);

    if (data != null && data['user'] != null) {
      final user = UserModel.fromJson(data['user']);
      Widget targetScreen;

      if (user.role == 'MAINTENANCE') {
        targetScreen = MaintenanceScreen(user: user);
      } else if (user.role == 'MANAGER' || user.role == 'ADMIN') {
        targetScreen = ManagerScreen(user: user);
      } else {
        targetScreen = WorkerScreen(user: user);
      }

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => targetScreen),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('LOGIN_ERROR: Đăng nhập thất bại. Kiểm tra lại thông tin!', style: TextStyle(fontFamily: 'monospace')),
          backgroundColor: Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      );
    }
  }

  void _quickSelectRole(String code, String pass) {
    _empCodeController.text = code;
    _passwordController.text = pass;
    _handleLogin();
  }

  @override
  Widget build(BuildContext context) {
    if (_showGuestPortal) {
      return GuestPortalScreen(
        onGoToLogin: () => setState(() => _showGuestPortal = false),
      );
    }

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Tactical Bordered Logo
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: Colors.transparent,
                  border: Border.all(color: const Color(0xFF06B6D4), width: 2),
                ),
                child: const Center(
                  child: Text('TBS', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 24, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 20),
              const Text('>>> HỆ THỐNG TBS II', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const Text('UNIT_MOBILE_TERMINAL // v1.0', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
              const SizedBox(height: 36),

              // Form
              TextField(
                controller: _empCodeController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Mã Nhân Viên',
                  prefixIcon: Icon(Icons.person, color: Color(0xFF06B6D4)),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Mật Khẩu',
                  prefixIcon: Icon(Icons.lock, color: Color(0xFF06B6D4)),
                ),
              ),
              const SizedBox(height: 28),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF06B6D4),
                    foregroundColor: Colors.black,
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.black)
                      : const Text('ĐĂNG NHẬP HỆ THỐNG', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed: () => setState(() => _showGuestPortal = true),
                  icon: const Icon(Icons.people_outline, color: Color(0xFF06B6D4), size: 18),
                  label: const Text('ỨNG TUYỂN & GIỚI THIỆU (GUEST)', style: TextStyle(color: Color(0xFF06B6D4), fontSize: 13)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF06B6D4)),
                  ),
                ),
              ),

              const SizedBox(height: 36),
              const Text('DEMO_AUTH_QUICK_SELECT:', style: TextStyle(color: Color(0xFF475569), fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    label: const Text('CN001 (Công Nhân)', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                    onPressed: () => _quickSelectRole('CN001', '123456'),
                  ),
                  ActionChip(
                    label: const Text('BT001 (Bảo Trì)', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                    onPressed: () => _quickSelectRole('BT001', '123456'),
                  ),
                  ActionChip(
                    label: const Text('SEP001 (Quản Lý)', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                    onPressed: () => _quickSelectRole('SEP001', '123456'),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
