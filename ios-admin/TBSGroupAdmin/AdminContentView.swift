import SwiftUI

struct AdminContentView: View {
    @State private var selectedTab = 0
    @State private var pendingApprovals = 2
    @State private var pendingTickets = 3
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // TAB 1: EXECUTIVE BI DASHBOARD
            AdminDashboardView()
                .tabItem {
                    Image(systemName: "chart.bar.fill")
                    Text("BI Dashboard")
                }
                .tag(0)
            
            // TAB 2: DOCUMENT APPROVALS
            AdminApprovalsView(pendingCount: $pendingApprovals)
                .tabItem {
                    Image(systemName: "doc.text.fill")
                    Text("Duyệt Giấy Tờ")
                }
                .badge(pendingApprovals)
                .tag(1)
            
            // TAB 3: MACHINE TICKET OVERRIDES
            AdminTicketsView(pendingCount: $pendingTickets)
                .tabItem {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text("Sự Cố Máy")
                }
                .badge(pendingTickets)
                .tag(2)
            
            // TAB 4: USERS & ROLES
            AdminUsersView()
                .tabItem {
                    Image(systemName: "person.3.fill")
                    Text("Nhân Viên")
                }
                .tag(3)
        }
        .accentColor(Color(red: 47/255, green: 211/255, blue: 154/255))
    }
}

// MARK: - DASHBOARD VIEW
struct AdminDashboardView: View {
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 8/255, green: 34/255, blue: 26/255).ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 16) {
                        // KPI OVERVIEW CARDS
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Doanh Số Tháng")
                                    .font(.caption2)
                                    .foregroundColor(.gray)
                                Text("48.5 Tỷ")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(red: 242/255, green: 220/255, blue: 154/255))
                                Text("↑ 8.4% vs tháng trước")
                                    .font(.caption2)
                                    .foregroundColor(Color(red: 47/255, green: 211/255, blue: 154/255))
                            }
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(red: 15/255, green: 65/255, blue: 51/255))
                            .cornerRadius(14)
                            
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Hiệu Suất OEE")
                                    .font(.caption2)
                                    .foregroundColor(.gray)
                                Text("97.8%")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                Text("2 máy đang dừng")
                                    .font(.caption2)
                                    .foregroundColor(.yellow)
                            }
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(red: 15/255, green: 65/255, blue: 51/255))
                            .cornerRadius(14)
                        }
                        
                        // TOP MACHINE BREAKDOWNS RANK
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Top Máy Hư Nhiều Nhất")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            
                            HStack {
                                Text("1. Máy May A4 (Line 2)")
                                    .font(.subheadline)
                                    .foregroundColor(.white)
                                Spacer()
                                Text("18 lần hỏng")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.red)
                            }
                            Divider().background(Color.gray.opacity(0.3))
                            
                            HStack {
                                Text("2. Máy Cắt B2 (Line 1)")
                                    .font(.subheadline)
                                    .foregroundColor(.white)
                                Spacer()
                                Text("14 lần hỏng")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.orange)
                            }
                        }
                        .padding()
                        .background(Color(red: 15/255, green: 65/255, blue: 51/255))
                        .cornerRadius(16)
                    }
                    .padding()
                }
            }
            .navigationTitle("TBS Admin BI 24/7")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - APPROVALS VIEW
struct AdminApprovalsView: View {
    @Binding var pendingCount: Int
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 8/255, green: 34/255, blue: 26/255).ignoresSafeArea()
                
                VStack(spacing: 14) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Đơn Xin Nghỉ Phép #DOC-991")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            Spacer()
                            Text("Chờ Duyệt")
                                .font(.caption2)
                                .padding(4)
                                .background(Color.yellow.opacity(0.3))
                                .foregroundColor(.yellow)
                                .cornerRadius(4)
                        }
                        Text("Người tạo: Nguyễn Văn A (EMP-088) - Phòng Sản Xuất")
                            .font(.caption)
                            .foregroundColor(.gray)
                        
                        HStack(spacing: 12) {
                            Button("Đồng Ý Duyệt") {
                                if pendingCount > 0 { pendingCount -= 1 }
                            }
                            .font(.caption)
                            .fontWeight(.bold)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(Color(red: 21/255, green: 138/255, blue: 99/255))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                            
                            Button("Từ Chối") {}
                                .font(.caption)
                                .fontWeight(.bold)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(Color.red.opacity(0.8))
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                    }
                    .padding()
                    .background(Color(red: 15/255, green: 65/255, blue: 51/255))
                    .cornerRadius(14)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Duyệt Biểu Mẫu iPhone")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - TICKETS OVERRIDE VIEW
struct AdminTicketsView: View {
    @Binding var pendingCount: Int
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 8/255, green: 34/255, blue: 26/255).ignoresSafeArea()
                
                VStack(spacing: 14) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("TK-8892 - Máy May A4 (Dừng Máy)")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.red)
                        Text("Chuyên gia phụ trách: Phạm Văn Bảo Trì")
                            .font(.caption)
                            .foregroundColor(.white)
                        
                        Button("Đổi Nhân Viên Bảo Trì Khác") {}
                            .font(.caption)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(6)
                    }
                    .padding()
                    .background(Color(red: 15/255, green: 65/255, blue: 51/255))
                    .cornerRadius(14)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Điều Hành Bảo Trì Máy")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - USERS & ROLES VIEW
struct AdminUsersView: View {
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 8/255, green: 34/255, blue: 26/255).ignoresSafeArea()
                
                VStack(alignment: .leading, spacing: 12) {
                    Text("Danh Sách Nhân Viên & Dynamic Roles")
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    HStack {
                        VStack(alignment: .leading) {
                            Text("EMP-001 - Super Admin")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 242/255, green: 220/255, blue: 154/255))
                            Text("Quyền: Level 1 (Full Access)")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Text("Active")
                            .font(.caption2)
                            .foregroundColor(Color(red: 47/255, green: 211/255, blue: 154/255))
                    }
                    .padding()
                    .background(Color(red: 15/255, green: 65/255, blue: 51/255))
                    .cornerRadius(12)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Quản Lý Nhân Viên")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
