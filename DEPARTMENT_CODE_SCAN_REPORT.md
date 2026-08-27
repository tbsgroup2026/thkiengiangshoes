# 🔍 DEPARTMENT CODE SCAN REPORT - BƯỚC 2

**Date:** August 24, 2026  
**Status:** ✅ COMPLETE - Hardcoded departments found and catalogued  
**Total Hardcoded References:** 4 major locations

---

## 📊 FINDINGS SUMMARY

### Legend
- 🔴 **HARDCODED** = Values written in code, need update on code change
- 🟡 **SEMI-DYNAMIC** = Fallback hardcoded values used only when API fails
- 🟢 **DYNAMIC** = Fetched from database, no update needed

---

## 🔴 HARDCODED DEPARTMENTS FOUND

### 1. **Admin Users Page** - `/admin/users`
**File:** `web/src/app/admin/users/page.tsx` (lines 19-26)  
**Status:** 🔴 HARDCODED  
**Purpose:** Department filter dropdown in user management

**Current Code:**
```typescript
const DEPARTMENTS_LIST = [
  { id: "cn_pph_ci", name: "CN-PPH & CI" },
  { id: "kd_ptsp", name: "KD PTSP" },
  { id: "khcb_ttpp", name: "KHCB-TTPP" },
  { id: "nhansu_hc", name: "NHÂN SỰ-HC" },
  { id: "qlcl_lab", name: "QLCL & LAB" },
  { id: "dh_qt", name: "ĐH-QT" },
];
```

**Used in:**
- Line 437: Department filter dropdown (`<select>` rendering)
- Filtering logic for displaying users by department

**Update Action:** ✅ Already has 6 NEW departments (looks correct!)

**Risk Level:** 🟢 LOW - Matches new department structure perfectly

---

### 2. **Business Trip Page - Form Fallback** - `/business-trip`
**File:** `web/src/app/business-trip/page.tsx` (lines 162-169)  
**Status:** 🟡 SEMI-DYNAMIC (has API fallback)  
**Purpose:** Participant department dropdown, fallback when API unavailable

**Current Code:**
```typescript
const DEFAULT_DEPARTMENTS_LIST = [
  "CN-PPH & CI",
  "KD PTSP",
  "KHCB-TTPP",
  "NHÂN SỰ-HC",
  "QLCL & LAB",
  "ĐH-QT",
];
```

**API Loading Logic (lines 180-215):**
```
1. Try fetch("/api/departments") → If success, use that
2. If fail, try fetch("/api/users") → Extract unique departments from users
3. If both fail, use DEFAULT_DEPARTMENTS_LIST (hardcoded fallback)
```

**Used in:**
- Line 1649: Participant department dropdown rendering
- Participant form when adding multiple travelers

**Update Action:** ✅ Already has 6 NEW departments (matches perfectly!)

**Risk Level:** 🟢 LOW - Primary source is dynamic (D1 database), hardcoded is just fallback

**Note:** When D1 database is updated with 370 employees, the `/api/users` endpoint will automatically return new departments, and this fallback becomes obsolete.

---

### 3. **Meeting Rooms Page - Room Booking**
**File:** `web/src/app/rooms/page.tsx` (lines 105-114)  
**Status:** 🔴 HARDCODED  
**Purpose:** Department selector for room booking

**Current Code:**
```typescript
export const DEPARTMENT_OPTIONS = [
  "BAN ĐH-QT",        // ← MISMATCH with new structure
  "KD PTSP",
  "QLCL",             // ← Incomplete (should be "QLCL & LAB")
  "NHÂN SỰ- HC",      // ← Space difference ("NHÂN SỰ-HC")
  "HÀNH CHÍNH",       // ← OLD department not in new list
  "KẾ TOÁN",          // ← OLD department not in new list
  "MUA HÀNG",         // ← OLD department not in new list
  "KHCB ĐHSX",        // ← OLD department not in new list
  "CN-PPH-CI",        // ← Hyphen difference ("CN-PPH & CI")
];
```

**Used in:**
- Line 2639: Room booking department select dropdown
- Line 3171: Another department select for room booking

**Update Action:** ⚠️ **NEEDS MAJOR UPDATE** - 4 out of 9 items don't match new structure

**Risk Level:** 🔴 CRITICAL - Mismatches will break room booking for new department structure

**Required Changes:**
```typescript
export const DEPARTMENT_OPTIONS = [
  "ĐH-QT",                   // Fixed: Remove "BAN"
  "KD PTSP",                 // ✓ Correct
  "QLCL & LAB",             // Fixed: Add " & LAB"
  "NHÂN SỰ-HC",             // Fixed: Remove space
  "CN-PPH & CI",            // Fixed: Use "&" instead of "-"
  "KHCB-TTPP",              // New: Add missing
  // Removed: "HÀNH CHÍNH", "KẾ TOÁN", "MUA HÀNG", "KHCB ĐHSX" (OLD structure)
];
```

---

## 🟢 DYNAMIC DEPARTMENTS (No Changes Needed)

### 4. **Backend Database - Prisma Schema**
**File:** `backend/prisma/schema.prisma`  
**Status:** 🟢 DYNAMIC  
**Purpose:** Department entity definition

**Structure:**
```typescript
model Department {
  id        String     @id
  name      String
  code      String     @unique
  parentId  String?
  parent    Department? @relation(...)
  children  Department[] @relation(...)
  users     User[]
  documents Document[]
  chatRooms ChatRoom[]
  jobs      Job[]
  createdAt DateTime
  updatedAt DateTime
}
```

**Update Action:** ✅ NO UPDATE NEEDED - Generic schema supports any department

**How it works:**
- New departments are stored in D1 PostgreSQL database
- Frontend fetches dynamically via `/api/users` or `/api/departments`
- No hardcoding in schema

---

### 5. **Backend Routes - Department Endpoint**
**File:** `backend/src/routes/departments.ts`  
**Status:** 🟢 DYNAMIC  
**Purpose:** Fetch all departments from database

**Query:**
```typescript
const departments = await prisma.department.findMany({
  include: {
    parent: { select: { name: true, code: true } }
  }
});
```

**Update Action:** ✅ NO UPDATE NEEDED - Fetches from database

---

## 📁 SQL UPDATE FILE EXISTS

**File:** `d:\Work\TBS II\web\update_departments.sql`  
**Status:** ✅ Already created  
**Contains:** 370 individual UPDATE statements for all employees

**Example:**
```sql
UPDATE users SET department = 'ĐH-QT' WHERE id = 227;    -- MSNV: 202011012
UPDATE users SET department = 'NHÂN SỰ-HC' WHERE id = 234; -- MSNV: 311505293
UPDATE users SET department = 'KD PTSP' WHERE id = 262;    -- MSNV: 202205023
...
```

---

## 🔧 REQUIRED CODE UPDATES

### Priority 1: CRITICAL 🔴
**File:** `web/src/app/rooms/page.tsx` (lines 105-114)
- **Issue:** 4 out of 9 department names don't match new structure
- **Fix:** Update DEPARTMENT_OPTIONS array (see "Required Changes" above)
- **Impact:** Room booking dropdown will be broken if not fixed

### Priority 2: LOW 🟡
**File:** `web/src/app/business-trip/page.tsx` (lines 162-169)
- **Issue:** Fallback hardcoded list (already correct with 6 new departments)
- **Action:** No change needed - will be overridden by dynamic data from D1
- **Note:** Can leave as-is, will work correctly after D1 update

### Priority 3: LOW 🟢
**File:** `web/src/app/admin/users/page.tsx` (lines 19-26)
- **Issue:** Already correct with 6 new departments
- **Action:** No change needed
- **Status:** Ready for deployment

---

## 📊 DEPARTMENT MAPPING TABLE

### NEW Structure (6 Departments)
| Code | Name | Users | Usage |
|------|------|-------|-------|
| ĐH-QT | Đầu Hàng - Quản Trị | 7 | Admin/Users ✓, Business-Trip ✓, **Rooms ⚠️** |
| NHÂN SỰ-HC | Nhân Sự - Hành Chính | 28 | Admin/Users ✓, Business-Trip ✓, **Rooms ⚠️** |
| KD PTSP | Kinh Doanh - Phát Triển SP | 182 | Admin/Users ✓, Business-Trip ✓, **Rooms ✓** |
| QLCL & LAB | Quản Lý Chất Lượng & Lab | 12 | Admin/Users ✓, Business-Trip ✓, **Rooms ⚠️** |
| CN-PPH & CI | Công Nghệ - PPH & CI | 37 | Admin/Users ✓, Business-Trip ✓, **Rooms ⚠️** |
| KHCB-TTPP | Kho Chứa Bán - TTPP | 104 | Admin/Users ✓, Business-Trip ✓, Rooms ✗ |

---

## ✅ VERIFICATION CHECKLIST

Before deploying the 370-employee update:

- [ ] Update `web/src/app/rooms/page.tsx` line 105-114
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] Test room booking page loads without errors
- [ ] Run SQL update: `web/update_departments.sql`
- [ ] Verify D1 database has 370 employees with new departments
- [ ] Test admin/users page shows correct department filter
- [ ] Test business-trip page loads with new departments
- [ ] Test business-trip pagination still works (15 per page)
- [ ] Test approval buttons show correctly for TRUONG_PHONG role

---

## 🚨 CRITICAL NOTES

### About Rooms Page ⚠️
The DEPARTMENT_OPTIONS in rooms/page.tsx appears to be OLD structure mixing different naming conventions:
- Some use hyphens: "NHÂN SỰ- HC" (old style)
- Some use inconsistent names: "KHCB ĐHSX" (not in new structure)
- Some use old prefixes: "BAN ĐH-QT", "CN-PPH-CI"

**This must be fixed before deploying the 370-employee update**, otherwise room bookings will fail or show wrong departments.

### About Business-Trip Fallback 🟡
The DEFAULT_DEPARTMENTS_LIST is already correctly configured with 6 NEW departments. When the D1 database is updated with the 370 employees, this hardcoded list becomes a fallback that may never be used (since the API will succeed and return dynamic data). No change needed, but it's good to verify after D1 update.

---

## 📋 NEXT STEPS

### BƯỚC 3: Report (THIS IS IT) ✅
- [x] Scan complete
- [x] Found 3 locations with hardcoded departments
- [x] Identified 1 CRITICAL issue (rooms page)
- [x] Documented all findings
- [x] Created mapping table

### BƯỚC 4: Deploy (When user confirms)
1. User reviews this report
2. User confirms the findings
3. Kiro updates rooms/page.tsx (1 file)
4. Run `npm run build`
5. Deploy build
6. Run SQL update (370 employees)
7. Test all pages

---

## 📁 FILES INVOLVED

**Frontend:**
- `web/src/app/rooms/page.tsx` - CRITICAL UPDATE NEEDED
- `web/src/app/business-trip/page.tsx` - Already correct
- `web/src/app/admin/users/page.tsx` - Already correct

**Backend:**
- `backend/prisma/schema.prisma` - No update needed (generic)
- `backend/src/routes/departments.ts` - No update needed (dynamic)

**Database:**
- `web/update_departments.sql` - Ready to execute (370 employees)

**Mapping Data:**
- `mapping_370_employees.json` - Reference for D1 update

---

**Report Generated:** August 24, 2026 by Kiro  
**Status:** ✅ READY FOR USER REVIEW

Waiting for user confirmation to proceed with BƯỚC 4 (Deploy).
