import SwiftUI

struct ContentView: View {
    @State private var userRole: String = "WORKER" // WORKER or MAINTENANCE
    @State private var pendingSyncCount: Int = Int(TBSCoreBridge.getPendingSyncCount())
    @State private var scannedMachineCode: String = "MC-MAY-04"
    @State private var incidentMessage: String = ""
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 8/255, green: 34/255, blue: 26/255)
                    .ignoresSafeArea()
                
                VStack(spacing: 20) {
                    // ROLE SELECTOR & OFFLINE BADGE
                    HStack {
                        Button(action: {
                            userRole = (userRole == "WORKER") ? "MAINTENANCE" : "WORKER"
                        }) {
                            Text(userRole == "WORKER" ? "Chế Độ: CÔNG NHÂN" : "Chế Độ: BẢO TRÌ")
                                .font(.caption)
                                .fontWeight(.bold)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .background(Color(red: 21/255, green: 138/255, blue: 99/255))
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                        
                        Spacer()
                        
                        Text(pendingSyncCount > 0 ? "Offline: \(pendingSyncCount) Pending" : "Online: Synced")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(pendingSyncCount > 0 ? Color(red: 217/255, green: 185/255, blue: 106/255) : Color(red: 47/255, green: 211/255, blue: 154/255))
                            .foregroundColor(.black)
                            .cornerRadius(6)
                    }
                    .padding(.horizontal)
                    
                    if userRole == "WORKER" {
                        // WORKER VIEW: SCAN QR & REPORT INCIDENT
                        VStack(alignment: .leading, spacing: 14) {
                            Text("📷 Quét Mã QR (AVFoundation + Vision)")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            
                            Text("Mã máy quét được: \(scannedMachineCode)")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 47/255, green: 211/255, blue: 154/255))
                            
                            Button(action: {
                                _ = TBSCoreBridge.reportIncident(withMachineCode: scannedMachineCode, errorType: "Lệch thấu kính", description: "Báo lỗi từ iOS App")
                                pendingSyncCount = Int(TBSCoreBridge.getPendingSyncCount())
                                incidentMessage = "✅ Đã lưu ticket sự cố vào C++ SQLite Core!"
                            }) {
                                Text("Gửi Báo Sự Cố Máy")
                                    .font(.callout)
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(red: 47/255, green: 211/255, blue: 154/255))
                                    .foregroundColor(.black)
                                    .cornerRadius(12)
                            }
                            
                            if !incidentMessage.isEmpty {
                                Text(incidentMessage)
                                    .font(.caption)
                                    .foregroundColor(Color(red: 242/255, green: 220/255, blue: 154/255))
                            }
                        }
                        .padding()
                        .background(Color(red: 15/255, green: 65/255, blue: 51/255))
                        .cornerRadius(16)
                        .padding(.horizontal)
                    } else {
                        // MAINTENANCE VIEW: TICKET ACTION STEPPER
                        VStack(alignment: .leading, spacing: 14) {
                            Text("🛠️ Ticket Bảo Trì (iOS Native SwiftUI)")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text("TK-8892 (Máy May A4)")
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(Color(red: 47/255, green: 211/255, blue: 154/255))
                                    Spacer()
                                    Text("Đang Sửa")
                                        .font(.caption2)
                                        .fontWeight(.bold)
                                        .padding(4)
                                        .background(Color.yellow.opacity(0.3))
                                        .foregroundColor(.yellow)
                                        .cornerRadius(4)
                                }
                                
                                Text("Lỗi: Đứt chỉ liên tục & kẹt ổ chao chuyền 2")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                
                                HStack {
                                    Button("1. Bắt Đầu Sửa") {}
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(Color.gray.opacity(0.4))
                                        .foregroundColor(.white)
                                        .cornerRadius(6)
                                    
                                    Button("2. Xóa Ticket / Hoàn Thành") {}
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(Color(red: 47/255, green: 211/255, blue: 154/255))
                                        .foregroundColor(.black)
                                        .cornerRadius(6)
                                }
                            }
                            .padding()
                            .background(Color.black.opacity(0.3))
                            .cornerRadius(12)
                        }
                        .padding()
                        .background(Color(red: 15/255, green: 65/255, blue: 51/255))
                        .cornerRadius(16)
                        .padding(.horizontal)
                    }
                    
                    Spacer()
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("TBS Group iOS Native")
                        .font(.headline)
                        .foregroundColor(Color(red: 242/255, green: 220/255, blue: 154/255))
                }
            }
        }
    }
}
