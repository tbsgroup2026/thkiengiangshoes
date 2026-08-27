package com.tbsgroup.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize C++ Core with storage path & Cloudflare Workers backend URL
        TBSNativeBridge.initCore(filesDir.absolutePath, "https://tbshethong.workers.dev")

        setContent {
            TBSNativeAppTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun TBSNativeAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF158A63),
            secondary = Color(0xFF2FD39A),
            background = Color(0xFF08221A),
            surface = Color(0xFF0F4133)
        ),
        content = content
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    var userRole by remember { mutableStateOf("WORKER") } // WORKER or MAINTENANCE
    var pendingSyncCount by remember { mutableStateOf(TBSNativeBridge.getPendingSyncCount()) }
    var scannedMachineCode by remember { mutableStateOf("MC-MAY-04") }
    var incidentReportedMessage by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("TBS Group Native App", fontWeight = FontWeight.Bold, color = Color(0xFFF2DC9A)) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF08221A))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFF08221A))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // ROLE SELECTOR & OFFLINE SYNC BADGE
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = { userRole = if (userRole == "WORKER") "MAINTENANCE" else "WORKER" },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF158A63))
                ) {
                    Text(if (userRole == "WORKER") "Chế Độ: CÔNG NHÂN" else "Chế Độ: BẢO TRÌ")
                }

                // C++ Core SQLite Offline Queue Status Indicator
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = if (pendingSyncCount > 0) Color(0xFFD9B96A) else Color(0xFF158A63)
                ) {
                    Text(
                        text = if (pendingSyncCount > 0) "Offline: $pendingSyncCount Pending" else "Online: Synced",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        color = Color.Black,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            if (userRole == "WORKER") {
                // WORKER SCREEN: SCAN QR & REPORT FAILURE
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0F4133))
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("📷 Quét Mã QR / Barcode Máy Hỏng", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color.White)
                        Text("Giả lập CameraX + ML Kit Scan", fontSize = 12.sp, color = Color.Gray)
                        
                        Text("Mã máy quét được: $scannedMachineCode", fontWeight = FontWeight.Bold, color = Color(0xFF2FD39A))

                        Button(
                            onClick = {
                                TBSNativeBridge.reportIncident(scannedMachineCode, "Đứt chỉ liên tục", "Kẹt ổ chao chuyền 2")
                                pendingSyncCount = TBSNativeBridge.getPendingSyncCount()
                                incidentReportedMessage = "✅ Đã gửi ticket hỏng máy! (Lưu SQLite offline nếu mất mạng)"
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2FD39A))
                        ) {
                            Text("Gửi Báo Sự Cố Máy", color = Color.Black, fontWeight = FontWeight.Bold)
                        }

                        if (incidentReportedMessage.isNotEmpty()) {
                            Text(incidentReportedMessage, color = Color(0xFFF2DC9A), fontSize = 12.sp)
                        }
                    }
                }
            } else {
                // MAINTENANCE SCREEN: TICKET LIST & STEPPER ACTIONS
                Text("🛠️ Danh Sách Ticket Bảo Trì Được Giao", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color.White)
                
                val sampleTickets = remember {
                    mutableStateListOf(
                        MaintenanceTicketItem("TK-8892", "MC-MAY-04", "Máy May A4", "Chờ Xác Nhận"),
                        MaintenanceTicketItem("TK-8891", "MC-CAT-02", "Máy Cắt B2", "Đang Sửa")
                    )
                }

                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(sampleTickets) { ticket ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F4133))
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(ticket.code, fontWeight = FontWeight.Bold, color = Color(0xFF2FD39A))
                                    Text(ticket.status, fontWeight = FontWeight.Bold, color = Color(0xFFF2DC9A), fontSize = 12.sp)
                                }
                                Text("${ticket.machineName} (${ticket.machineCode})", color = Color.White)
                                
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        onClick = { ticket.status = "Đã Đến Nơi - Bắt Đầu Sửa" },
                                        enabled = ticket.status != "Đã Hoàn Thành"
                                    ) {
                                        Text("1. Bắt Đầu", fontSize = 10.sp)
                                    }
                                    Button(
                                        onClick = { ticket.status = "Đã Hoàn Thành" },
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2FD39A))
                                    ) {
                                        Text("2. Hoàn Thành", fontSize = 10.sp, color = Color.Black)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

data class MaintenanceTicketItem(
    val code: String,
    val machineCode: String,
    val machineName: String,
    var status: String
)
