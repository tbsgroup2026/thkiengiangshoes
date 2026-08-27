# ✅ APPROVAL BUTTON FIX - Applied Successfully

**Date:** August 24, 2026  
**Issue:** Approval buttons (Duyệt TP / Duyệt BGĐ) not showing for Trưởng Phòng and Giám Đốc roles  
**Status:** ✅ FIXED & BUILD VERIFIED

---

## 🔍 ROOT CAUSE ANALYSIS

### Problem 1: Missing `roleCode` in `getCurrentUser()` return
**Location:** `web/src/lib/userProfiles.ts` (lines 554-561)

The `UserProfile` interface has `roleCode` field, but `getCurrentUser()` function was not returning it in the return object. This meant the approval logic in `usePermission` hook couldn't determine the user's actual role.

**Before:**
```typescript
return {
  ...parsed,
  empCode: normalizedCode,
  name: ...,
  title: ...,
  department: ...,
  email: ...,
  avatar: finalAvatar,
  // ❌ Missing roleCode!
};
```

**After:**
```typescript
return {
  ...parsed,
  empCode: normalizedCode,
  name: ...,
  title: ...,
  department: ...,
  email: ...,
  roleCode: baseInfo?.roleCode || parsed.roleCode || "CBCNV",  // ✅ Added
  avatar: finalAvatar,
};
```

---

### Problem 2: Button logic only checked department, not role
**Location:** `web/src/app/business-trip/page.tsx` (lines 2014-2017)

The approval button condition was too permissive and didn't specifically check for `TRUONG_PHONG` role. It would show buttons to anyone with matching department:

**Before:**
```typescript
{(isExecutiveOrAdmin || !currentUser?.department || !rec.department || 
  currentUser.department.trim().toLowerCase() === rec.department.trim().toLowerCase()) && (
  // Show Duyệt TP button
)}
```

This meant:
- ❌ Anyone with same department could see approval buttons
- ❌ Didn't validate that user is actually Trưởng Phòng
- ✅ Only executives showed buttons

**After:**
```typescript
{(isExecutiveOrAdmin || (currentUser?.roleCode === "TRUONG_PHONG" && 
  currentUser?.department?.trim().toLowerCase() === rec.department?.trim().toLowerCase())) && (
  // Show Duyệt TP button ONLY for real Trưởng Phòng of that department
)}
```

Now it correctly checks:
1. Is user executive/admin? OR
2. Is user TRUONG_PHONG role AND belongs to same department as business trip?

---

### Problem 3: `currentUser` state type missing `roleCode`
**Location:** `web/src/app/business-trip/page.tsx` (line 256)

The React state type didn't have `roleCode` field, causing TypeScript error.

**Before:**
```typescript
const [currentUser, setCurrentUser] = useState<{ 
  name: string; 
  title: string; 
  department: string; 
  avatar: string 
}>({ ... });
```

**After:**
```typescript
const [currentUser, setCurrentUser] = useState<{ 
  name: string; 
  title: string; 
  department: string; 
  avatar: string; 
  roleCode?: string  // ✅ Added optional field
}>({ ... });
```

Also updated the `setCurrentUser` call to include `roleCode`:
```typescript
setCurrentUser({
  name: userName,
  title: cur.title || "Cán Bộ Công Nhân Viên",
  department: userDept,
  avatar: cur.avatar || "/images/tbs-logo.png",
  roleCode: cur.roleCode || "CBCNV",  // ✅ Added
});
```

---

## ✅ VERIFICATION

### Build Status
```
✓ Compiled successfully in 10.5s
✓ Finished TypeScript in 16.5s
✓ No errors or type issues
```

### Files Modified
1. `web/src/lib/userProfiles.ts` - Added `roleCode` to return object
2. `web/src/app/business-trip/page.tsx` - Updated button logic & state type

### Testing Checklist

After deploying, verify these scenarios:

**✓ Scenario 1: CBCNV (Cán Bộ Công Nhân Viên)**
- Creates business trip
- Logs in as different CBCNV user
- [ ] NO approval buttons appear
- [ ] Only sees "Chờ TP duyệt Lịch" status

**✓ Scenario 2: TRUONG_PHONG (Trưởng Phòng)**
- Employee creates trip for their department
- Logs in as Trưởng Phòng of SAME department
- [ ] "Duyệt TP" & "Từ chối" buttons appear
- [ ] Can click and approve trip
- Trip status changes to PENDING_L2

**✓ Scenario 3: TRUONG_PHONG (Wrong Department)**
- Employee creates trip for Department A
- Logs in as Trưởng Phòng of Department B
- [ ] NO approval buttons appear
- [ ] Sees trip but cannot approve

**✓ Scenario 4: GĐ/PGĐ/PTGĐ (Ban Giám Đốc)**
- After Trưởng Phòng approves
- Logs in as GĐ/GIAM_DOC
- [ ] "Duyệt BGĐ" & "Từ chối" buttons appear (Level 2)
- [ ] Can approve regardless of department
- Trip status changes to APPROVED

**✓ Scenario 5: TGĐ (Tổng Giám Đốc)**
- Can see ALL trips at any stage
- [ ] Can approve Level 1 & 2
- [ ] Can approve own/other trips (isExecutiveOrAdmin = true)

---

## 📋 RELATED LOGIC

### Role Hierarchy (from `usePermission` hook)
```typescript
const EXECS = [
  "TONG_GIAM_DOC",        // TGĐ (CEO)
  "PHO_TONG_GIAM_DOC",    // P.TGĐ
  "GIAM_DOC",             // GĐ
  "PHO_GIAM_DOC",         // P.GĐ
  "SUPER_ADMIN", "SYSTEM_ADMIN", ...
];
```

Approval button logic now:
- **LEVEL 1 (Duyệt TP)**: TRUONG_PHONG of matching department + same trip department
- **LEVEL 2 (Duyệt BGĐ)**: Any executive/admin (GĐ, P.GĐ, P.TGĐ, TGĐ)

---

## 🚀 DEPLOYMENT NOTES

**Before deploying to production:**
1. Clear browser cache / localStorage if stuck on old session
2. Ensure all role_codes in D1 database are correct:
   - `TRUONG_PHONG` for department heads
   - `GIAM_DOC` for directors
   - `PHO_GIAM_DOC` for deputy directors
   - etc.

**Testing URL:**
```
https://vpchuoiskechers.tbsgroup2026.workers.dev/business-trip
```

**Demo Workflow:**
1. Create trip as CBCNV
2. Switch to Trưởng Phòng account
3. Approval buttons should appear
4. Click "Duyệt TP" to move to Level 2
5. Switch to GĐ account  
6. Click "Duyệt BGĐ" to complete approval

---

## ✅ CHECKLIST FOR USER

- [x] Fix applied to `getCurrentUser()` to return `roleCode`
- [x] Fix applied to approval button logic to check `roleCode === "TRUONG_PHONG"`
- [x] State type updated to include `roleCode` field
- [x] TypeScript compilation verified (exit code 0)
- [x] Build completed successfully
- [ ] Deploy to production
- [ ] Test all 5 scenarios above
- [ ] Confirm buttons show correctly for Trưởng Phòng & GĐ

---

**Status:** ✅ READY FOR TESTING

Code is compiled and ready. Once deployed, test with the Trưởng Phòng account to verify approval buttons now appear correctly!

