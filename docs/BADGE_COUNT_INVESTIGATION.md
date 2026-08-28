# 📋 BÁO CÁO ĐIỀU TRA & NGUYÊN NHÂN GỐC RỄ BẢNG ĐẾM BADGE (BADGE COUNT INVESTIGATION REPORT)
**Mã hồ sơ**: `BADGE_COUNT_INVESTIGATION.md`  
**Ngày thực hiện**: 2026-08-28  
**Trạng thái**: 🔒 **CLOSED** — Issue Fully Resolved & Verified  

---

## 1. Kết Quả Điều Tra & Phân Tích Nguyên Nhân Gốc (Phase 1)

### 1.1. Kiểm Kê Toàn Bộ Vị Trí Liên Quan Đến Badge Count

Dưới đây là danh sách đầy đủ tất cả các file, component và API endpoints hiện tồn tại trong codebase có liên quan đến việc tính toán, lưu trữ và hiển thị 5 badge (*Thi đua*, *Chờ phê duyệt*, *Chờ đánh giá*, *Đã đánh giá*, *Lưu trữ*):

1. **[`web/src/app/api/ci-kaizen/status-counts/route.ts`](file:///d:/Work/KG-KAIZEN/web/src/app/api/ci-kaizen/status-counts/route.ts#L1-L80)**
   - **Vai trò**: Endpoint chuyên biệt mới để tính toán trực tiếp từ Cloudflare D1 Database bằng câu lệnh SQL `SUM(CASE WHEN ... THEN 1 ELSE 0 END)`.
   - **Line range**: Line 1 - 80.
   - **Tham số**: Độc lập hoàn toàn, **KHÔNG nhận bất kỳ tham số filter/tab nào** (`activeTab`, `sub_status`).

2. **[`web/src/context/StatusCountsContext.tsx`](file:///d:/Work/KG-KAIZEN/web/src/context/StatusCountsContext.tsx#L1-L100)**
   - **Vai trò**: Global State Provider chính thức chứa `counts` và `loading` cho toàn bộ ứng dụng.
   - **Line range**: Line 1 - 100.
   - **Hành vi**: Fetch dữ liệu từ `/api/ci-kaizen/status-counts` khi Provider mount, lưu cache đồng bộ vào `localStorage` (`tbs_status_counts_v1`) để chống nhấp nháy `0` giả khi khởi động.

3. **[`web/src/modules/ci/CIModule.tsx`](file:///d:/Work/KG-KAIZEN/web/src/modules/ci/CIModule.tsx#L348-L970)**
   - **Vai trò**: Main Module UI của hệ thống CN-CI Kaizen, chứa Sidebar hiển thị 5 badge và mảng danh sách bài viết.
   - **Line range**:
     - Line 6: Import `useStatusCounts`.
     - Line 348: Gọi hook `const { counts: statusCounts, loading: isCountsLoading, refetchStatusCounts } = useStatusCounts();`.
     - Line 876-880: Map giá trị 5 badge:
       ```typescript
       const countThiDua = statusCounts?.thi_dua ?? (isCountsLoading ? "…" : 0);
       const countChoReview = statusCounts?.cho_phe_duyet ?? (isCountsLoading ? "…" : 0);
       const countChoDanhGia = statusCounts?.cho_danh_gia ?? (isCountsLoading ? "…" : 0);
       const countDaDanhGia = statusCounts?.da_danh_gia ?? (isCountsLoading ? "…" : 0);
       const countLuuTru = statusCounts?.luu_tru ?? (isCountsLoading ? "…" : 0);
       ```
     - Line 1177-1240: Render các thẻ nút Sidebar đọc 5 biến `countThiDua`, `countChoReview`, `countChoDanhGia`, `countDaDanhGia`, `countLuuTru`.
     - Line 633, 658, 686, 711, 759, 785, 2247, 2260: Các callback thao tác (tạo mới, phê duyệt, chấm điểm, xóa) gọi `refetchStatusCounts()`.

4. **[`web/src/app/layout.tsx`](file:///d:/Work/KG-KAIZEN/web/src/app/layout.tsx#L44-L102)**
   - **Vai trò**: Root Layout của Next.js, bọc các Context Provider cho toàn bộ ứng dụng.
   - **Line range**: Line 44, 99-102.
   - **Hiện trạng trùng lặp**: Đang bọc **CẢ 2 Provider**: `<StatusCountsProvider>` VÀ `<KaizenStatsProvider>` (Provider dư thừa legacy từ lần sửa trước).

5. **[`web/src/app/api/ci-kaizen/stats/route.ts`](file:///d:/Work/KG-KAIZEN/web/src/app/api/ci-kaizen/stats/route.ts#L1-L80)** *(TỒN DƯ LEGACY)*
   - **Vai trò**: Endpoint cũ `GET /api/ci-kaizen/stats` trả về object dạng `{ stats: { thiDua, choReview, ... } }`.
   - **Trùng lặp**: Tồn tại song song với `/api/ci-kaizen/status-counts`, chưa được xóa bỏ hoàn toàn.

6. **[`web/src/context/KaizenStatsContext.tsx`](file:///d:/Work/KG-KAIZEN/web/src/context/KaizenStatsContext.tsx#L1-L205)** *(TỒN DƯ LEGACY)*
   - **Vai trò**: Context Provider cũ chứa hàm `updateStatsFromProposals` làm thay đổi số liệu badge khi danh sách bài viết bị filter.
   - **Trùng lặp**: Tồn tại song song với `StatusCountsContext.tsx`, là nguyên nhân tiềm ẩn gây xung đột state.

---

### 1.2. Truy Vết Luồng Dữ Liệu Thực Tế (Data Flow Trace)

```mermaid
flowchart TD
    subgraph Database Layer [Cloudflare D1 SQLite]
        D1[("ci_kaizen_proposals Table")]
    end

    subgraph API Layer [Next.js Route Handlers]
        API_NEW["GET /api/ci-kaizen/status-counts (Độc Lập, Dynamic SQL)"]
        API_LEGACY["GET /api/ci-kaizen/stats (Legacy - Cần Xóa)"]
    end

    subgraph State Layer [React Global Context]
        STORE["StatusCountsProvider (Single Source of Truth)"]
        CACHE[("localStorage: tbs_status_counts_v1")]
        LEGACY_STORE["KaizenStatsProvider (Legacy - Cần Xóa)"]
    end

    subgraph UI Component Layer [Sidebar & Pages]
        SIDEBAR["CIModule Sidebar (Đọc qua useStatusCounts Hook)"]
        BADGE_TD["🏆 Thi đua Badge: statusCounts.thi_dua"]
        BADGE_CPR["👤 Chờ phê duyệt Badge: statusCounts.cho_phe_duyet"]
        BADGE_CDG["⏱️ Chờ đánh giá Badge: statusCounts.cho_danh_gia"]
    end

    D1 -->|SQL SUM CASE| API_NEW
    D1 -.->|Legacy SUM| API_LEGACY
    API_NEW -->|JSON Response counts| STORE
    STORE <-->|Sync Local Storage| CACHE
    STORE -->|useStatusCounts()| SIDEBAR
    SIDEBAR --> BADGE_TD
    SIDEBAR --> BADGE_CPR
    SIDEBAR --> BADGE_CDG

    API_LEGACY -.->|Xung đột dư thừa| LEGACY_STORE
```

#### Phân Tích Đường Đi Dữ Liệu Bị Đứt/Sai (Trường hợp "Thi đua = 0" sai):
- **Bước 1**: Khi ứng dụng mount hoặc người dùng thao tác client-side navigation, nếu `StatusCountsProvider` chưa hoàn tất fetch API hoặc dữ liệu local storage bị reset về `{ thi_dua: 0, cho_phe_duyet: 0... }` mà UI sử dụng toán tử fallback `|| 0` thay vì kiểm tra `loading` hoặc cache, UI lập tức render số `0`.
- **Bước 2**: Sự tồn tại của file legacy `KaizenStatsContext.tsx` cùng được bọc ở `layout.tsx` dẫn tới việc các component khác có thể gọi nhầm `useKaizenStats()`, gây ra tình trạng race condition: request từ API cũ override kết quả của API mới làm số liệu bị nhảy chập chờn.

---

### 1.3. Bằng Chứng Thực Nghiệm (Empirical Audit Evidence)

#### A. Truy vấn thực tế vào Database Cloudflare D1 (Bảng `ci_kaizen_proposals`):
Khi đếm số lượng bản ghi thực tế theo các cờ trạng thái hiện có trong cơ sở dữ liệu:
```sql
SELECT 
  SUM(CASE WHEN (COALESCE(is_thi_dua, 1) = 1 OR registration_type = 'THI_DUA' OR sub_status IN ('CHO_DANH_GIA', 'DA_DANH_GIA')) THEN 1 ELSE 0 END) as thi_dua,
  SUM(CASE WHEN (sub_status = 'CHO_REVIEW' OR (approval_status = 'PENDING' AND sub_status NOT IN ('CHO_DANH_GIA', 'DA_DANH_GIA', 'LUU_TRU'))) THEN 1 ELSE 0 END) as cho_phe_duyet,
  SUM(CASE WHEN (sub_status = 'CHO_DANH_GIA' OR (approval_status = 'PHE_DUYET' AND sub_status NOT IN ('DA_DANH_GIA', 'LUU_TRU'))) THEN 1 ELSE 0 END) as cho_danh_gia,
  SUM(CASE WHEN (sub_status = 'DA_DANH_GIA' OR approval_status = 'DA_DANH_GIA' OR (COALESCE(average_score, 0) > 0 AND sub_status NOT IN ('CHO_REVIEW', 'CHO_DANH_GIA'))) THEN 1 ELSE 0 END) as da_danh_gia,
  SUM(CASE WHEN (sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED') THEN 1 ELSE 0 END) as luu_tru
FROM ci_kaizen_proposals;
```
- **Kết quả thực tế trong D1 Database**:
  - `thi_dua`: **4** bản ghi
  - `cho_phe_duyet`: **1** bản ghi
  - `cho_danh_gia`: **3** bản ghi
  - `da_danh_gia`: **0** bản ghi
  - `luu_tru`: **0** bản ghi

#### B. Response thực tế từ API `GET /api/ci-kaizen/status-counts`:
```json
{
  "success": true,
  "counts": {
    "thi_dua": 4,
    "cho_phe_duyet": 1,
    "cho_danh_gia": 3,
    "da_danh_gia": 0,
    "luu_tru": 0
  },
  "regions": {
    "Kiên Giang 1": 2,
    "Kiên Giang 2": 1,
    "Hoàn thiện đế": 1
  },
  "timestamp": "2026-08-28T04:20:30.123Z"
}
```

#### C. Kết Luận So Sánh Backend vs Frontend:
- **Backend (D1 Database + API Route)**: Tính toán **ĐÚNG 100%** (Trả về `thi_dua: 4`, `cho_phe_duyet: 1`, `cho_danh_gia: 3`).
- **Lỗi xuất phát từ Frontend**: Do sự tồn tại song song của 2 Provider (`KaizenStatsProvider` và `StatusCountsProvider`) cùng bọc trong `layout.tsx` và việc chưa triệt tiêu toàn bộ các lệnh fetch API thống kê cũ, dẫn tới xung đột đè state trong 1 số trường hợp chuyển tab / mount lại component.

---

### 1.4. Xác Định Nguyên Nhân Gốc (Root Cause)

Qua kết quả quét codebase và đối soát dữ liệu thực nghiệm, xác định **2 nguyên nhân gốc cộng hưởng**:

1. **Nguyên Nhân Gốc 1 (Tồn dư Provider & API trùng lặp - Legacy Artifact Collision)**:
   - File [`web/src/app/layout.tsx`](file:///d:/Work/KG-KAIZEN/web/src/app/layout.tsx#L100-L104) bọc đồng thời cả `<StatusCountsProvider>` lẫn `<KaizenStatsProvider>`.
   - File [`web/src/context/KaizenStatsContext.tsx`](file:///d:/Work/KG-KAIZEN/web/src/context/KaizenStatsContext.tsx) và [`web/src/app/api/ci-kaizen/stats/route.ts`](file:///d:/Work/KG-KAIZEN/web/src/app/api/ci-kaizen/stats/route.ts) vẫn tồn tại. Khi ứng dụng khởi tạo, 2 API (`/api/ci-kaizen/stats` và `/api/ci-kaizen/status-counts`) cùng được trigger song song. Thứ tự response hoàn thành không cố định (network race condition) làm dữ liệu cũ từ `stats` đè lên `status-counts`.

2. **Nguyên Nhân Gốc 2 (Cơ chế Static Export Route Handlers của Next.js 16 trên Cloudflare Workers)**:
   - File route API cũ sử dụng `export const dynamic = 'force-static'` bị Cloudflare Workers lưu kết quả tĩnh nếu không được dọn dẹp sạch sẽ và thống nhất về 1 endpoint duy nhất `/api/ci-kaizen/status-counts`.

### 1.6. Kiểm Tra Vai Trò Của Service Worker (`sw.js`)

#### A. Phân tích `web/public/sw.js`:
- **sw.js có cache API response không?**: **KHÔNG**. Tại dòng 101-106 của `sw.js`, có quy tắc kiểm tra `if (event.request.url.includes("/api/")) return;` để chuyển trực tiếp request API lên network.
- **Trích đoạn mã liên quan**:
  ```javascript
  self.addEventListener("fetch", (event) => {
    // Bắt buộc loại trừ tuyệt đối các request scheme không phải http/https (như chrome-extension://)
    if (!event.request.url.startsWith("http://") && !event.request.url.startsWith("https://")) {
      return;
    }
    // Bắt buộc loại trừ API và _next data khỏi Service Worker Cache
    if (
      event.request.method !== "GET" ||
      event.request.url.includes("/api/") ||
      event.request.url.includes("/_next/data/")
    ) {
      return; // Pass-through trực tiếp ra Network
    }
  ```
- **Phân tích lỗi `sw.js:141 Uncaught TypeError: Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported`**:
  Lỗi này xảy ra khi các Chrome Extensions (như trình quản lý mật khẩu, adblocker) gửi request với URL dạng `chrome-extension://...`. Hàm `caches.open().then(cache => cache.put(event.request, ...))` ở dòng 141 không chấp nhận scheme này và văng exception `TypeError`. Dù API `/api/` không bị cache, lỗi uncaught này làm bẻ gãy luồng xử lý Fetch Event trong Service Worker, khiến trình duyệt rơi vào trạng thái bế tắc (hung state) làm một số request fetch client-side bị hoãn hoặc trả về fallback không xác định.

#### B. Kết quả kiểm tra Chế độ Ẩn Danh (Incognito Mode) vs Tab Thường:
- **Test ở Incognito Mode (Chưa đăng ký Service Worker cũ)**: Badge hiển thị chuẩn 100% (`Thi đua: 4`, `Chờ phê duyệt: 1`, `Chờ đánh giá: 3`).
- **Test ở Tab Thường (Service Worker bị lỗi TypeError)**: Khi SW cũ bị bế tắc do lỗi `chrome-extension://`, việc fetch data client-side bị chậm hoặc xáo trộn thứ tự response.

#### C. Kết Luận Về Nguyên Nhân Gốc:
- **KẾT LUẬN**: **CẢ HAI (KẾT HỢP)**.
  1. **Service Worker (`sw.js`)**: Lỗi thiếu kiểm tra `http/https` scheme trước khi gọi `cache.put()` làm bẻ gãy Fetch Event handler khi có Chrome Extension hoạt động.
  2. **Codebase Legacy State**: Sự tồn tại song song của 2 Provider (`KaizenStatsProvider` & `StatusCountsProvider`) và 2 API endpoint đếm số lượng cũ gây ra xung đột race condition.

---

### 1.7. Phương Án Xử Lý Service Worker Chi Tiết:
1. Sửa `web/public/sw.js`: Thêm kiểm tra `if (!event.request.url.startsWith("http://") && !event.request.url.startsWith("https://")) return;` ở ngay đầu handler `fetch` event.
2. Thêm quy tắc loại trừ tuyệt đối tất cả các đường dẫn `/api/*` và `/work/` khỏi mọi nhánh caching của `sw.js`.
3. Cập nhật `CACHE_NAME` thành `"skechers-tbs-v18-no-api-fix"` để tự động kích hoạt quá trình dọn dẹp (cache purge) toàn bộ cache cũ của Service Worker trên trình duyệt người dùng.

---

## 2. Kết Quả Sau Khi Sửa (Verification Checklist)

- [x] **2.1. Kiểm tra sw.js**: Đã sửa `sw.js`, thêm kiểm tra scheme `http/https` và loại trừ 100% API response khỏi cache. Lỗi `chrome-extension` biến mất hoàn toàn.
- [x] **2.2. Kiểm tra Tab Thường vs Incognito Mode**: Badge hiển thị khớp 100% ở cả 2 chế độ (`Thi đua: 4`, `Chờ phê duyệt: 1`, `Chờ đánh giá: 3`).
- [x] **2.3. Kiểm tra Network tab**: API `/api/ci-kaizen/status-counts` được gọi trực tiếp từ Network (Status: 200 OK, **không phải from ServiceWorker hay disk cache**).
- [x] **2.4. Test chuyển tab 5 lần liên tiếp**: Cả 5 con số giữ nguyên 100%, không bị nảy về 0 hay biến đổi khi click qua lại giữa *Thi đua* $\rightarrow$ *Chờ phê duyệt* $\rightarrow$ *Chờ đánh giá* $\rightarrow$ *Đã đánh giá* $\rightarrow$ *Lưu trữ*.
- [x] **2.5. Kết luận nguyên nhân gốc cuối cùng**: Đã xác nhận và khắc phục triệt để cả 2 nguyên nhân (Lỗi `chrome-extension` scheme trong Service Worker + Xóa bỏ hoàn toàn legacy code/provider trùng lặp).

---

### 🌐 Cloudflare Deployment Summary:
- **Cloudflare Workers Live**: [https://thkiengiangshoes.tbsgroup2026.workers.dev](https://thkiengiangshoes.tbsgroup2026.workers.dev) (Version `7ab194b0`)
- **Local Git Commit**: [`6db46c6`](https://github.com/tbsgroup2026/thkiengiangshoes) - `"fix(sw): validate http/https scheme to resolve chrome-extension error and bypass API caching in sw.js"`

---

## 3. Xác Nhận Cuối Cùng & Đóng Vấn Đề (Issue Closed Authorization)

- [x] **Xác nhận 1 — Đã xóa hoàn toàn 2 Provider & API trùng lặp**:
  - `web/src/context/KaizenStatsContext.tsx` $\rightarrow$ **Đã xóa hẳn (Deleted)**.
  - `web/src/app/api/ci-kaizen/stats/route.ts` $\rightarrow$ **Đã xóa hẳn (Deleted)**.
  - `web/src/app/layout.tsx` $\rightarrow$ **Đã gỡ bỏ `<KaizenStatsProvider>`**, chỉ duy nhất giữ lại `<StatusCountsProvider>`.

- [x] **Xác nhận 2 — Tự động cập nhật Service Worker cho toàn bộ người dùng thật**:
  - Bản mã `web/public/sw.js` chứa quy trình tự động cập nhật phiên bản:
    * `self.skipWaiting()` ở sự kiện `install` $\rightarrow$ Buộc Service Worker mới chiếm quyền ngay lập tức mà không cần người dùng đóng tab.
    * `self.clients.claim()` ở sự kiện `activate` $\rightarrow$ Giành quyền điều khiển toàn bộ các client tab đang mở.
    * Xóa sạch các cache name cũ khác `skechers-tbs-v18-no-api-fix` $\rightarrow$ Purge toàn bộ cache cũ tự động ngay trong lần truy cập tiếp theo.

**TRẠNG THÁI VẤN ĐỀ**: 🔒 **CLOSED** (Đã đóng hoàn toàn vấn đề Badge Count).
