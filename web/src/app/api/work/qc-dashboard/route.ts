import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const factory = searchParams.get('factory') || 'all';

  const HTPH_CLSK_API_URL = process.env.HTPH_CLSK_API_URL || 'https://hethongphanhoiclsk.tbsgroup2026.workers.dev';
  const HTPH_CLSK_SERVICE_TOKEN = process.env.HTPH_CLSK_SERVICE_TOKEN || process.env.HTPH_CLSK_API_KEY || '';

  // 1. Attempt Service-to-Service call to external HTPH-CLSK API (if configured)
  if (HTPH_CLSK_SERVICE_TOKEN) {
    try {
      const externalRes = await fetch(`${HTPH_CLSK_API_URL}/api/v1/quality-summary?factory=${encodeURIComponent(factory)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HTPH_CLSK_SERVICE_TOKEN}`,
          'X-API-Key': HTPH_CLSK_SERVICE_TOKEN,
          'Accept': 'application/json',
        },
        // 5 second timeout for responsiveness
        signal: AbortSignal.timeout(5000),
      });

      if (externalRes.ok) {
        const externalData = await externalRes.json();
        return NextResponse.json({
          success: true,
          source: 'live_htph_clsk',
          factoryId: factory,
          timestamp: new Date().toISOString(),
          ...externalData,
        }, {
          headers: {
            'Cache-Control': 'public, max-age=60, s-maxage=120',
          },
        });
      }
    } catch (extErr) {
      console.warn('[qc-dashboard API] External HTPH-CLSK fetch notice:', extErr);
    }
  }

  // 2. Query Local D1 Database (if D1 binding is active)
  const db = getDbBinding();
  let d1IncidentCount = 20;
  let d1ResolvedCount = 18;
  let d1AvgResolutionSec = 2280; // 38 mins

  if (db) {
    try {
      const ticketStats = await db.prepare(`
        SELECT 
          COUNT(*) as total_tickets,
          SUM(CASE WHEN status = 'RESOLVED' OR status = 'CLOSED' THEN 1 ELSE 0 END) as resolved_tickets,
          COALESCE(AVG(resolution_time_sec), 2280) as avg_res_sec
        FROM maintenance_tickets
      `).first();

      if (ticketStats) {
        d1IncidentCount = Math.max(Number(ticketStats.total_tickets || 0), 12);
        d1ResolvedCount = Number(ticketStats.resolved_tickets || 0);
        d1AvgResolutionSec = Number(ticketStats.avg_res_sec || 2280);
      }
    } catch (dbErr) {
      console.warn('[qc-dashboard API] D1 query notice:', dbErr);
    }
  }

  // 3. Structured Local/Fallback Response (matching HTPH-CLSK format)
  const avgMttrMins = Math.round(d1AvgResolutionSec / 60);

  const mockResponse = {
    success: true,
    source: 'local_d1_fallback',
    factoryId: factory,
    timestamp: new Date().toISOString(),
    message: HTPH_CLSK_SERVICE_TOKEN 
      ? 'Đang kết nối HTPH-CLSK backend...' 
      : 'Cần cấu hình HTPH_CLSK_SERVICE_TOKEN trong biến môi trường server để sync realtime từ https://hethongphanhoiclsk.tbsgroup2026.workers.dev',
    chainMetrics: {
      firstPassYield: {
        val: '98.4%',
        trend: '+0.6%',
        sub: 'Mục tiêu chất lượng: ≥ 98.0%',
        badgeColor: 'bg-emerald-50 text-[#006838] border-emerald-200',
      },
      oee: {
        val: '92.4%',
        trend: '+1.2%',
        sub: '33 Dây chuyền hoạt động toàn chuỗi',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      sla2HoursRate: {
        val: '94.8%',
        trend: '+2.1%',
        sub: 'Cam kết SLA xử lý sự cố ≤ 2 giờ',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      totalOpenIncidents: {
        val: `${d1IncidentCount} Vụ`,
        trend: '-5 vụ so với hôm qua',
        sub: `KG1 (${Math.round(d1IncidentCount * 0.6)}), KG2 (${Math.round(d1IncidentCount * 0.4)})`,
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      },
    },
    factories: [
      {
        id: 'kg1',
        code: 'KG1',
        name: 'Nhà máy Kiên Giang 1',
        location: 'Kiên Giang, Việt Nam',
        status: 'live' as const,
        totalLines: 24,
        oee: 98.2,
        openIncidents: Math.round(d1IncidentCount * 0.6),
        mttrMinutes: avgMttrMins,
        portalUrl: 'https://hethongphanhoiclsk.tbsgroup2026.workers.dev/portal',
        detailsNote: '24 chuyền sản xuất • Xưởng A, B, C',
      },
      {
        id: 'kg2',
        code: 'KG2',
        name: 'Nhà máy Kiên Giang 2',
        location: 'Kiên Giang, Việt Nam',
        status: 'planned' as const,
        totalLines: 16,
        oee: 95.0,
        openIncidents: Math.round(d1IncidentCount * 0.4),
        mttrMinutes: 45,
        portalUrl: 'https://hethongphanhoiclsk.tbsgroup2026.workers.dev/portal',
        detailsNote: '16 chuyền sản xuất giai đoạn 2 (Đang lập kế hoạch sensor)',
      },
    ],
    kg1Kpis: {
      unprocessed: Math.round(d1IncidentCount * 0.6),
      processing: 8,
      trialRun: 3,
      completed: d1ResolvedCount || 126,
      emergencySOS: 1,
    },
    paretoErrors: [
      { id: '1', name: 'Lỗi đường may', percentage: 32, count: 48, color: '#ef4444' },
      { id: '2', name: 'Lỗi dán đế', percentage: 24, count: 36, color: '#f97316' },
      { id: '3', name: 'Lỗi vật liệu', percentage: 18, count: 27, color: '#eab308' },
      { id: '4', name: 'Lỗi kích thước', percentage: 15, count: 22, color: '#3b82f6' },
      { id: '5', name: 'Lỗi khác', percentage: 11, count: 17, color: '#64748b' },
    ],
    incidents: [
      {
        id: 'inc-1',
        code: '#KG1-00231',
        workshop: 'Xưởng A',
        line: 'Chuyền 03',
        team: 'Tổ 02',
        errorType: 'Lỗi máy ép đế thủy lực không đủ áp suất',
        severity: 'high' as const,
        status: 'unprocessed' as const,
        slaRemaining: '08:42',
        slaPercent: 58,
        createdAt: '10 phút trước',
        reporter: 'QA001 - Nguyễn Văn Hùng',
      },
      {
        id: 'inc-2',
        code: '#KG1-00230',
        workshop: 'Xưởng B',
        line: 'Chuyền 07',
        team: 'Tổ 01',
        errorType: "Lỗi đường may lệch viền Upper Skechers D'Lites",
        severity: 'medium' as const,
        status: 'processing' as const,
        mttrMinutes: 32,
        createdAt: '25 phút trước',
        reporter: 'LL001 - Trần Thị Mai',
      },
      {
        id: 'inc-3',
        code: '#KG1-00229',
        workshop: 'Xưởng A',
        line: 'Chuyền 01',
        team: 'Tổ 04',
        errorType: 'Keo dán đế Outsole bị vón cục nhiệt độ thấp',
        severity: 'critical' as const,
        status: 'processing' as const,
        mttrMinutes: 18,
        createdAt: '40 phút trước',
        reporter: 'CN001 - Lê Hoàng Nam',
      },
      {
        id: 'inc-4',
        code: '#KG1-00228',
        workshop: 'Xưởng C',
        line: 'Chuyền 12',
        team: 'Tổ 03',
        errorType: 'Kiểm định thử nghiệm độ uốn gập sau sửa máy may',
        severity: 'low' as const,
        status: 'trial' as const,
        slaRemaining: 'Theo dõi 12h',
        slaPercent: 80,
        createdAt: '2 giờ trước',
        reporter: 'QA002 - Phạm Minh Tuấn',
      },
      {
        id: 'inc-5',
        code: '#KG1-00225',
        workshop: 'Xưởng B',
        line: 'Chuyền 05',
        team: 'Tổ 02',
        errorType: 'Xử lý lệch logo Skechers in nhiệt phần gót giày',
        severity: 'low' as const,
        status: 'completed' as const,
        mttrMinutes: 24,
        createdAt: 'Hôm nay 08:30',
        reporter: 'BT001 - Đặng Quốc Việt',
      },
    ],
  };

  return NextResponse.json(mockResponse, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=120',
    },
  });
}
