'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  IconBuildingFactory2,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconUsers,
  IconShoe,
  IconTarget,
  IconChartBar,
  IconChevronRight,
  IconLock,
  IconX,
  IconUserCheck,
  IconPencil,
  IconPercentage,
} from '@tabler/icons-react';

type PphSlotEntry = {
  slot: string;
  filled: boolean;
  workerCount?: number | null;
  model?: string | null;
  plannedQty?: number | null;
  targetRft?: number | null;
  actualQty?: number | null;
  shortfallReason?: string | null;
  shortfallSolution?: string | null;
};

type ScanInfo = {
  success: boolean;
  error?: string;
  team?: { id: string; name: string; lineName: string; areaName: string; factoryName: string };
  date?: string;
  slots?: string[];
  filledSlots?: string[];
  entries?: PphSlotEntry[];
  perHourTarget?: number | null;
  setup?: { workerCount: number; model: string; plannedQty: number; targetRft: number } | null;
  nextAction?: 'setup' | 'quantity' | 'wait' | 'done';
  targetSlot?: string | null;
  nextSlot?: string;
};

const REMEMBERED_NAME_KEY = 'pph_scan_reporter_name';

// Trang quét QR CÔNG KHAI, mở qua camera Zalo — không cần đăng nhập. teamId truyền qua query
// param (?team=...), KHÔNG dùng route segment động vì site build tĩnh (output:'export') không
// biết trước danh sách Tổ lúc build — xem next.config.ts.
export default function PphScanClient() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('team') || '';

  // Trang build tĩnh (output:'export') — lúc build KHÔNG có URL thật nên teamId luôn rỗng trong
  // bản HTML tĩnh ban đầu; chỉ sau khi hydrate xong ở trình duyệt, useSearchParams() mới đọc được
  // đúng ?team=... từ URL thật. Nếu kiểm tra "!teamId" TRƯỚC khi biết chắc đã hydrate xong, màn
  // hình sẽ chớp qua "Thiếu mã Tổ" (sai) rồi mới chuyển sang "Đang tải..." rồi mới ra form đúng —
  // đúng hiện tượng "xoay load chập chờn" người dùng báo cáo (thấy rõ hơn khi JS đã có sẵn trong
  // cache trình duyệt nên hydrate rất nhanh, các bước chớp nối tiếp nhau rõ rệt). `mounted` chỉ
  // true SAU khi đã chắc chắn chạy xong ở client — trước đó luôn hiện "Đang tải..." trung tính.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [info, setInfo] = useState<ScanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittedBy, setSubmittedBy] = useState('');
  const [rememberedName, setRememberedName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [workerCount, setWorkerCount] = useState('');
  const [model, setModel] = useState('');
  const [plannedQty, setPlannedQty] = useState('');
  const [targetRft, setTargetRft] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [shortfallReason, setShortfallReason] = useState('');
  const [shortfallSolution, setShortfallSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slot: string } | null>(null);
  const [showSlotPanel, setShowSlotPanel] = useState(false);
  const [countdownLabel, setCountdownLabel] = useState<string | null>(null);
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // Trang này CÔNG KHAI, quét bởi rất nhiều điện thoại khác nhau, không cần chức năng offline/PWA
  // gì (luôn cần mạng thật để nộp số liệu) — nên KHÔNG có lý do gì để Service Worker can thiệp vào
  // đây cả, và SW từng là nguồn gốc hàng loạt sự cố "kẹt/chập chờn" khó dò khác nhau suốt phiên làm
  // việc hôm nay (bản cache cũ trên điện thoại đã ghé từ trước khi có các bản sửa mới nhất). Chủ
  // động HUỶ ĐĂNG KÝ mọi Service Worker của domain — đảm bảo từ lần vào trang NÀY trở đi không còn
  // tầng SW nào chen vào giữa nữa, chỉ còn HTTP thuần (đã ép no-store cho HTML).
  //
  // QUAN TRỌNG: đã tự kiểm chứng bằng Chrome thật (headless, giả lập điện thoại) — nếu chạy việc
  // huỷ đăng ký này NGAY LÚC MOUNT (cùng lúc với form đang tải dữ liệu lần đầu), nó CẠNH TRANH tài
  // nguyên với chính quá trình tải/hiển thị form, gây đúng cảm giác giật/chập chờn lúc tải (dù cuối
  // cùng vẫn ra đúng kết quả) — đặc biệt rõ trên máy yếu vì huỷ 1 SW đang thực sự điều khiển trang
  // là việc tốn tài nguyên (Chrome phải chờ dừng hẳn việc SW đang chặn fetch). Nên CHỦ ĐỘNG ĐỢI đến
  // khi form đã hiển thị xong (loading=false) rồi mới âm thầm dọn dẹp SW ở nền, không cạnh tranh gì
  // với trải nghiệm của người dùng đang xem/nhập liệu nữa.
  useEffect(() => {
    if (loading) return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const t = setTimeout(() => {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {});
      if ('caches' in window) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [loading]);

  // Nhớ tên người báo cáo TRÊN CHÍNH ĐIỆN THOẠI này — chỉ lần đầu tiên (bất kỳ Tổ nào) mới phải
  // gõ tên, các lần quét sau tự điền sẵn, vẫn cho bấm "Đổi tên" nếu điện thoại đổi người dùng.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBERED_NAME_KEY) || '';
      if (saved) {
        setRememberedName(saved);
        setSubmittedBy(saved);
      }
    } catch {}
  }, []);

  const load = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/pph/scan-info?teamId=${encodeURIComponent(teamId)}`).then((r) => r.json());
      setInfo(res);
    } catch (err) {
      console.warn('Failed to fetch scan-info:', err);
      setInfo({ success: false, error: 'Không kết nối được tới hệ thống' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // Sau khi ghi nhận thành công, tự chuyển sang khung giờ TIẾP THEO mà KHÔNG cần quét lại mã QR —
  // tải lại thông tin sau ~1.8s (đủ để đọc dòng "Đã ghi nhận!"), rồi hiện thẳng form của khung kế
  // tiếp (hoặc trạng thái phù hợp: chờ/đã xong). An toàn không lặp vô hạn vì đây là timer 1 lần,
  // tách biệt hẳn với đồng hồ đếm ngược khung giờ (đã fix riêng ở effect bên dưới).
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      setSuccess(null);
      load();
    }, 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  // Nếu tải lâu bất thường (mạng yếu, hoặc trình duyệt đang giữ 1 bản trang cũ không tải nổi file
  // mới) — sau 8s hiện thêm nút "Tải lại trang" thay vì để màn hình quay vòng vô tận không rõ lý do.
  useEffect(() => {
    if (!loading) {
      setLoadingTooLong(false);
      return;
    }
    const t = setTimeout(() => setLoadingTooLong(true), 8000);
    return () => clearTimeout(t);
  }, [loading]);

  // Đồng hồ đếm ngược HIỂN THỊ — đếm từ giờ VN hiện tại TỚI ĐÚNG GIỜ của khung đang chờ (VD khung
  // "08:30" thì đếm tới đúng 08:30, không phải tới lúc khung ĐÓNG như bản trước) — đúng theo yêu
  // cầu người dùng. Chỉ hiện khi giờ đó CÒN Ở TƯƠNG LAI (form đang mở sớm nhờ trừ hao 10 phút); một
  // khi đã tới/qua đúng giờ của khung thì ẩn hẳn số đếm (không còn gì để đếm nữa, cứ nhập bình
  // thường) — KHÔNG gắn hành động tự tải lại vào đây (tách riêng ở effect bên dưới) để không lặp.
  useEffect(() => {
    if (!info?.targetSlot || info.nextAction !== 'quantity') {
      setCountdownLabel(null);
      return;
    }
    const slotOwnTimeMs = slotLabelToDeadlineVNMs(info.targetSlot, 0);
    if (slotOwnTimeMs - vnNowMs() <= 0) {
      setCountdownLabel(null); // Đã tới/qua giờ của khung — không đếm nữa
      return;
    }
    const tick = () => {
      const diffMs = slotOwnTimeMs - vnNowMs();
      if (diffMs <= 0) {
        setCountdownLabel(null);
        return;
      }
      const totalSec = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setCountdownLabel(h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [info?.targetSlot, info?.nextAction]);

  // Tự tải lại NGẦM (không hiện số đếm nào) khi khung đang nhập THỰC SỰ hết hạn (= mốc bắt đầu của
  // khung kế tiếp, trừ hao 10 phút, khớp đúng luật pphResolveStatus() phía backend) — để tự chuyển
  // sang khung mới mà không bắt người dùng phải tự bấm làm mới.
  //
  // BUG ĐÃ TÌM RA VÀ SỬA TRƯỚC ĐÓ (nguyên nhân "quét lần 2 xoay/giật liên tục"): pphResolveStatus()
  // phía backend cố tình trả về khung SỚM NHẤT còn thiếu — kể cả khung đó đã trễ rất lâu (VD cập
  // nhật đầu ca lúc 14h thì targetSlot vẫn là "08:30" để "bắt kịp"). Với 1 khung đã trễ như vậy,
  // mốc hết hạn (= khung kế tiếp - 10 phút) CŨNG đã trôi qua từ lâu — nếu không kiểm tra trước, tick
  // đầu tiên lập tức thấy "đã hết giờ" và tự gọi load(); load() trả về info MỚI (object JSON parse
  // lại — LUÔN khác reference dù giá trị giống hệt), khiến effect này (phụ thuộc info?.slots) bị
  // coi là "đổi" và CHẠY LẠI ngay — rồi lại lập tức thấy hết giờ, lại load()... lặp vô hạn. Fix: CHỈ
  // hẹn giờ tải lại khi mốc hết hạn còn ở TƯƠNG LAI ngay từ đầu; nếu đã trễ sẵn thì không hẹn gì cả.
  useEffect(() => {
    if (!info?.slots || !info.targetSlot || info.nextAction !== 'quantity') return;
    const idx = info.slots.indexOf(info.targetSlot);
    const nextBoundarySlot = idx >= 0 ? info.slots[idx + 1] : undefined;
    if (!nextBoundarySlot) return; // Khung cuối ngày — không còn mốc để tự chuyển tiếp
    const windowCloseMs = slotLabelToDeadlineVNMs(nextBoundarySlot, 10);
    const diffMs = windowCloseMs - vnNowMs();
    if (diffMs <= 0) return; // Đã trễ sẵn (khung "bắt kịp") — không hẹn lại, tránh lặp vô hạn
    const t = setTimeout(() => load(), diffMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.slots, info?.targetSlot, info?.nextAction]);

  // Hụt Mục tiêu/giờ — so số đang gõ (chưa cần bấm gửi) với Mục tiêu/giờ suy ra từ kế hoạch đầu ca.
  const parsedActualQty = actualQty === '' ? null : Number(actualQty);
  const shortfallAmount =
    info?.perHourTarget != null && parsedActualQty != null && Number.isFinite(parsedActualQty)
      ? Math.round((info.perHourTarget - parsedActualQty) * 10) / 10
      : null;
  const isShortfallNow = info?.perHourTarget != null && info.perHourTarget > 0 && shortfallAmount != null && shortfallAmount > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalName = submittedBy.trim();
    if (!finalName) {
      setFormError('Vui lòng nhập tên người báo cáo');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const isSetup = info?.nextAction === 'setup';
      const body: Record<string, unknown> = { teamId, submittedBy: finalName };
      if (isSetup) {
        const wc = Number(workerCount);
        const pq = Number(plannedQty);
        const rft = Number(targetRft);
        if (!Number.isFinite(wc) || wc <= 0) { setFormError('Vui lòng nhập đúng Số lượng công nhân'); setSubmitting(false); return; }
        if (!model.trim()) { setFormError('Vui lòng nhập Model sản xuất'); setSubmitting(false); return; }
        if (!Number.isFinite(pq) || pq <= 0) { setFormError('Vui lòng nhập đúng Sản lượng kế hoạch cả ca'); setSubmitting(false); return; }
        if (!Number.isFinite(rft) || rft < 0 || rft > 100) { setFormError('Vui lòng nhập đúng Mục tiêu hàng đạt chuẩn (RFT 0-100%)'); setSubmitting(false); return; }
        body.workerCount = wc;
        body.model = model.trim();
        body.plannedQty = pq;
        body.targetRft = rft;
      } else {
        const aq = Number(actualQty);
        if (!Number.isFinite(aq) || aq < 0) { setFormError('Vui lòng nhập đúng Số lượng'); setSubmitting(false); return; }
        body.actualQty = aq;
        // Hụt Mục tiêu/giờ — bắt buộc Nguyên nhân + Giải pháp trước khi gửi (server cũng tự kiểm
        // tra lại, đây là chặn sớm phía form cho người dùng thấy lỗi ngay, không cần chờ mạng).
        if (isShortfallNow) {
          if (!shortfallReason.trim()) { setFormError('Số lượng đang thấp hơn Mục tiêu/giờ — vui lòng nhập Nguyên nhân'); setSubmitting(false); return; }
          if (!shortfallSolution.trim()) { setFormError('Số lượng đang thấp hơn Mục tiêu/giờ — vui lòng nhập Giải pháp'); setSubmitting(false); return; }
          body.shortfallReason = shortfallReason.trim();
          body.shortfallSolution = shortfallSolution.trim();
        }
      }
      const res = await fetch('/api/pph/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!result.success) {
        setFormError(result.error || 'Không lưu được, vui lòng thử lại');
        return;
      }
      try {
        window.localStorage.setItem(REMEMBERED_NAME_KEY, finalName);
      } catch {}
      setRememberedName(finalName);
      // Dọn sạch ô nhập số lượng + giải trình hụt chỉ tiêu — vì giờ tự chuyển sang khung tiếp theo
      // ngay trên cùng form (không quét lại QR), không dọn thì khung sau sẽ thấy lại số cũ.
      setActualQty('');
      setShortfallReason('');
      setShortfallSolution('');
      setSuccess({ slot: result.slot });
    } catch {
      setFormError('Không kết nối được tới hệ thống, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || loading) {
    return (
      <ScanShell>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#006838] border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Đang tải...</p>
          {loadingTooLong && (
            <div className="text-center pt-2 space-y-2">
              <p className="text-[11px] text-slate-400">Tải hơi lâu — mạng yếu hoặc trình duyệt đang giữ bản trang cũ.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-[#006838] text-white text-xs font-bold hover:opacity-90"
              >
                Tải lại trang
              </button>
            </div>
          )}
        </div>
      </ScanShell>
    );
  }

  if (!teamId) {
    return (
      <ScanShell>
        <StateCard icon={IconAlertTriangle} tone="rose" title="Thiếu mã Tổ" desc="Đường dẫn QR không hợp lệ — vui lòng quét lại mã đã dán tại Tổ." />
      </ScanShell>
    );
  }

  if (!info?.success || !info.team) {
    return (
      <ScanShell>
        <StateCard icon={IconAlertTriangle} tone="rose" title="Không tìm thấy Tổ" desc={info?.error || 'Mã QR có thể đã cũ — liên hệ quản lý để lấy mã mới.'} />
      </ScanShell>
    );
  }

  // Sau khi ghi nhận, tự chuyển sang khung kế tiếp sau ~1.8s (xem effect ở trên) — không cần quét
  // lại mã QR mới nhập được khung tiếp theo.
  if (success) {
    return (
      <ScanShell team={info.team}>
        <StateCard
          icon={IconCircleCheck}
          tone="emerald"
          title="Đã ghi nhận!"
          desc={`Cập nhật khung giờ ${success.slot} thành công. Cảm ơn bạn!`}
        />
        <p className="text-center text-[11px] text-slate-400 font-semibold -mt-2">Đang chuyển sang khung tiếp theo...</p>
      </ScanShell>
    );
  }

  if (info.nextAction === 'wait') {
    return (
      <ScanShell team={info.team} onClickSlotBadge={() => setShowSlotPanel(true)} slotBadgeLabel={info.nextSlot}>
        <StateCard icon={IconClock} tone="amber" title="Chưa tới giờ nhập" desc={`Khung tiếp theo lúc ${info.nextSlot}. Quay lại quét sau nhé.`} />
        {showSlotPanel && (
          <SlotHistoryPanel info={info} onClose={() => setShowSlotPanel(false)} />
        )}
      </ScanShell>
    );
  }

  if (info.nextAction === 'done') {
    return (
      <ScanShell team={info.team}>
        <StateCard icon={IconCircleCheck} tone="emerald" title="Đã cập nhật đủ hôm nay" desc="Cảm ơn bạn đã báo cáo đầy đủ các khung giờ hôm nay!" />
      </ScanShell>
    );
  }

  const isSetup = info.nextAction === 'setup';

  return (
    <ScanShell
      team={info.team}
      onClickSlotBadge={!isSetup ? () => setShowSlotPanel(true) : undefined}
      slotBadgeLabel={!isSetup ? (info.targetSlot ?? undefined) : undefined}
    >
      <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
        <IconClock size={14} />
        <span className="flex-1">{isSetup ? 'Cập nhật đầu ca' : `Khung giờ ${info.targetSlot}`}</span>
        {countdownLabel && (
          <span className="font-mono tabular-nums text-[11px] px-2 py-0.5 rounded-lg bg-white/70 border border-emerald-200">
            còn {countdownLabel}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {isSetup ? (
          <>
            <Field label="Số lượng công nhân hôm nay *" icon={IconUsers}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={workerCount}
                onChange={(e) => setWorkerCount(e.target.value)}
                placeholder="VD: 42"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
                required
              />
            </Field>
            <Field label="Model sản xuất *" icon={IconShoe}>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="VD: SK-GoRun-2026"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
                required
              />
            </Field>
            <Field label="Sản lượng kế hoạch cả ca *" icon={IconTarget}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={plannedQty}
                onChange={(e) => setPlannedQty(e.target.value)}
                placeholder="VD: 411"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
                required
              />
            </Field>
            {/* Chỉ tự tính & hiện xem trước — không phải ô nhập, suy ra từ Sản lượng kế hoạch cả ca
                chia đều 8 khung số lượng, khớp đúng công thức perHourTarget bên server. */}
            <div className="flex items-center justify-between gap-3 px-3.5 py-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <IconChartBar size={13} className="text-emerald-600" />
                Mục tiêu sản lượng mỗi giờ (PPH)
              </span>
              <span className="text-sm font-black text-emerald-700">
                {plannedQty && Number.isFinite(Number(plannedQty)) && Number(plannedQty) > 0
                  ? `${Math.round((Number(plannedQty) / 8) * 10) / 10} đôi/giờ`
                  : '—'}
              </span>
            </div>
            <Field label="Mục tiêu hàng đạt chuẩn (RFT %) *" icon={IconPercentage}>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step="0.1"
                value={targetRft}
                onChange={(e) => setTargetRft(e.target.value)}
                placeholder="VD: 98"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
                required
              />
            </Field>
          </>
        ) : (
          <>
            <Field
              label={`Số lượng làm được (${info.targetSlot}) *`}
              hint={info.perHourTarget != null ? `Mục tiêu: ${info.perHourTarget} đôi/giờ` : undefined}
              icon={IconChartBar}
            >
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value)}
                placeholder="VD: 45"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
                required
                autoFocus
              />
            </Field>

            {isShortfallNow && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <IconAlertTriangle size={14} className="shrink-0" />
                  Đang âm {shortfallAmount} đôi so với Mục tiêu/giờ
                </p>
                <Field label="Nguyên nhân *" icon={IconAlertTriangle}>
                  <textarea
                    value={shortfallReason}
                    onChange={(e) => setShortfallReason(e.target.value)}
                    placeholder="VD: Máy hư, thiếu nguyên liệu, đổi model..."
                    rows={2}
                    className="w-full px-3.5 py-3 bg-white border border-rose-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-400 resize-none"
                    required
                  />
                </Field>
                <Field label="Giải pháp *" icon={IconCircleCheck}>
                  <textarea
                    value={shortfallSolution}
                    onChange={(e) => setShortfallSolution(e.target.value)}
                    placeholder="VD: Đã gọi bảo trì, bổ sung nhân lực..."
                    rows={2}
                    className="w-full px-3.5 py-3 bg-white border border-rose-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-400 resize-none"
                    required
                  />
                </Field>
              </div>
            )}
          </>
        )}

        {rememberedName && !editingName ? (
          <div className="flex items-center gap-2.5 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl">
            <IconUserCheck size={16} className="text-[#006838] shrink-0" />
            <span className="flex-1 text-sm font-semibold text-slate-700 truncate">
              Báo cáo bởi <span className="font-black text-slate-900">{rememberedName}</span>
            </span>
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-[11px] font-bold text-[#006838] hover:underline flex items-center gap-1 shrink-0"
            >
              <IconPencil size={12} /> Đổi tên
            </button>
          </div>
        ) : (
          <Field label="Tên người báo cáo *" icon={IconUsers}>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="Nhập họ tên của bạn"
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
              required
              autoFocus={!!rememberedName}
            />
            {rememberedName && (
              <button
                type="button"
                onClick={() => { setEditingName(false); setSubmittedBy(rememberedName); }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 mt-1"
              >
                Huỷ, dùng lại tên đã lưu
              </button>
            )}
          </Field>
        )}

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">⚠️ {formError}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-[#006838] text-white text-sm font-black hover:opacity-90 disabled:opacity-50 transition"
        >
          {submitting ? 'Đang lưu...' : 'Xác Nhận Cập Nhật'}
        </button>
      </form>

      {showSlotPanel && <SlotHistoryPanel info={info} onClose={() => setShowSlotPanel(false)} />}
    </ScanShell>
  );
}

// Đồng hồ đếm ngược tính theo ĐÚNG giờ Việt Nam (UTC+7) — KHÔNG phụ thuộc múi giờ đặt trên điện
// thoại (đề phòng máy bị đặt sai giờ/múi giờ), khớp chính xác cách backend tính pphNowVN() trong
// _worker.js: cộng UTC+7 vào mốc UTC thật rồi ĐỌC bằng các hàm getUTC* của kết quả.
function vnNowMs(): number {
  return Date.now() + 7 * 60 * 60 * 1000;
}

// Parse nhãn "HH:MM" thành mốc "giờ VN hôm nay" (cùng hệ quy chiếu với vnNowMs()), trừ hao 10 phút
// — khớp đúng luật pphResolveStatus() phía backend, để đồng hồ đếm ngược hiển thị đúng lúc khung
// giờ thật sự đóng.
// bufferMinutes: trừ hao bao nhiêu phút so với nhãn giờ gốc — dùng 0 để lấy ĐÚNG giờ của khung
// (hiển thị đếm ngược cho người dùng xem), dùng 10 để lấy mốc "khung kế tiếp mở sớm" (khớp luật
// pphResolveStatus() phía backend, dùng cho việc tự tải lại khi khung hiện tại thực sự đóng).
function slotLabelToDeadlineVNMs(slotLabel: string, bufferMinutes: number): number {
  const [h, m] = slotLabel.split(':').map(Number);
  const vnNow = new Date(vnNowMs());
  return Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate(), h, m - bufferMinutes, 0, 0);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function ScanShell({
  team,
  children,
  onClickSlotBadge,
  slotBadgeLabel,
}: {
  team?: { name: string; lineName: string; areaName: string; factoryName: string };
  children: React.ReactNode;
  onClickSlotBadge?: () => void;
  slotBadgeLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f4f7f5] flex items-start justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-4 justify-center">
          <img src="/images/tbs-logo.png" alt="TBS Group" className="h-7 w-auto object-contain" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Hiệu Suất Nhà Máy</span>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/70 p-5 sm:p-6">
          {team && (
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <IconBuildingFactory2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black text-slate-900 text-sm truncate">{team.name}</div>
                <div className="text-[11px] text-slate-400 font-semibold truncate">
                  {[team.factoryName, team.areaName, team.lineName].filter(Boolean).join(' › ')}
                </div>
              </div>
              {onClickSlotBadge && slotBadgeLabel && (
                <button
                  type="button"
                  onClick={onClickSlotBadge}
                  title="Xem tất cả khung giờ trong ngày"
                  className="shrink-0 flex items-center gap-1 pl-2.5 pr-1.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#006838]/60 hover:bg-emerald-50 transition-colors"
                >
                  <IconClock size={13} className="text-[#006838]" />
                  <span className="text-xs font-black text-slate-700">{slotBadgeLabel}</span>
                  <IconChevronRight size={13} className="text-slate-400" />
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// Bảng xem lại TẤT CẢ khung giờ trong ngày — bấm vào khung ĐÃ NHẬP để xem lại số lượng (KHÔNG sửa
// được), khung TƯƠNG LAI chưa tới giờ chỉ hiện trạng thái khoá, không cho nhập gì ở đây (luồng
// nhập số lượng thật vẫn chỉ đi qua form chính bên dưới, đúng khung mà server đang mở).
function SlotHistoryPanel({ info, onClose }: { info: ScanInfo; onClose: () => void }) {
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const entries = info.entries || [];
  const currentTarget = info.nextAction === 'quantity' || info.nextAction === 'setup' ? info.targetSlot : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-sm">Các khung giờ hôm nay</h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <IconX size={14} className="text-slate-500" />
          </button>
        </div>
        <div className="p-3 space-y-1.5">
          {entries.map((e) => {
            const isCurrent = e.slot === currentTarget;
            const isSetupRow = e.slot === '08:00';
            const isExpanded = expandedSlot === e.slot;
            const label = isSetupRow ? 'Đầu ca' : e.slot;

            let statusNode: React.ReactNode;
            if (e.filled) {
              statusNode = <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ĐÃ NHẬP</span>;
            } else if (isCurrent) {
              statusNode = <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">ĐANG MỞ</span>;
            } else {
              statusNode = <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-0.5"><IconLock size={9} /> CHƯA TỚI</span>;
            }

            return (
              <div key={e.slot} className="rounded-xl border border-slate-100 overflow-hidden">
                <button
                  type="button"
                  disabled={!e.filled}
                  onClick={() => e.filled && setExpandedSlot(isExpanded ? null : e.slot)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left transition-colors ${
                    e.filled ? 'bg-white hover:bg-slate-50 cursor-pointer' : isCurrent ? 'bg-amber-50/50' : 'bg-slate-50/60'
                  }`}
                >
                  <span className={`text-sm font-black ${e.filled ? 'text-slate-900' : isCurrent ? 'text-amber-700' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  <span className="flex items-center gap-2">
                    {statusNode}
                    {e.filled && <IconChevronRight size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
                  </span>
                </button>
                {isExpanded && e.filled && (
                  <div className="px-3.5 pb-3.5 pt-1 bg-slate-50/60 space-y-1 text-xs">
                    {isSetupRow ? (
                      <>
                        <DetailRow label="Số lượng công nhân" value={e.workerCount ?? '—'} />
                        <DetailRow label="Model sản xuất" value={e.model ?? '—'} />
                        <DetailRow label="Sản lượng kế hoạch cả ca" value={e.plannedQty ?? '—'} />
                        <DetailRow
                          label="Mục tiêu sản lượng mỗi giờ (PPH)"
                          value={e.plannedQty ? `${Math.round((e.plannedQty / 8) * 10) / 10} đôi/giờ` : '—'}
                        />
                        <DetailRow label="Mục tiêu hàng đạt chuẩn (RFT)" value={e.targetRft != null ? `${e.targetRft}%` : '—'} />
                      </>
                    ) : (
                      <>
                        <DetailRow label="Số lượng làm được" value={e.actualQty ?? '—'} />
                        {(e.shortfallReason || e.shortfallSolution) && (
                          <div className="pt-1.5 mt-1.5 border-t border-rose-100 space-y-1">
                            <p className="text-rose-600 font-black text-[11px]">⚠️ Hụt mục tiêu/giờ hôm đó:</p>
                            {e.shortfallReason && <DetailRow label="Nguyên nhân" value={e.shortfallReason} />}
                            {e.shortfallSolution && <DetailRow label="Giải pháp" value={e.shortfallSolution} />}
                          </div>
                        )}
                      </>
                    )}
                    <p className="text-[10px] text-slate-400 italic pt-1">Chỉ xem lại — không thể chỉnh sửa khung giờ đã qua.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 font-semibold">{label}</span>
      <span className="text-slate-800 font-black">{value}</span>
    </div>
  );
}

function Field({
  label,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  hint?: string;
  icon: typeof IconUsers;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
        <Icon size={13} className="text-slate-400" />
        {label}
        {hint && <span className="font-semibold text-slate-400">— {hint}</span>}
      </span>
      {children}
    </label>
  );
}

const TONE_CLS: Record<string, { bg: string; text: string; iconBg: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-100' },
};

function StateCard({
  icon: Icon,
  tone,
  title,
  desc,
}: {
  icon: typeof IconCircleCheck;
  tone: 'emerald' | 'amber' | 'rose';
  title: string;
  desc: string;
}) {
  const t = TONE_CLS[tone];
  return (
    <div className="text-center py-6 space-y-3">
      <div className={`w-14 h-14 mx-auto rounded-2xl ${t.iconBg} ${t.text} flex items-center justify-center`}>
        <Icon size={26} />
      </div>
      <h3 className="font-black text-slate-900 text-base">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed px-2">{desc}</p>
    </div>
  );
}
