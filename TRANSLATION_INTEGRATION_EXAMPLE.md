# Example: How to Integrate Translations into Business Trip Form

## Current Implementation vs. Translation-Ready Implementation

### ❌ BEFORE (Hardcoded Strings)

```typescript
<label className="text-xs font-bold text-slate-700 block">
  Tên đề xuất công tác <span className="text-rose-500">*</span>
</label>

<label className="text-xs font-bold text-slate-700 block">
  Khu vực <span className="text-rose-500">*</span>
</label>

<button onClick={handleSubmit}>
  Gửi Đề Xuất Công Tác
</button>

showToast("⚠️ Tên đề xuất công tác là bắt buộc!");
showToast("⚠️ Khu vực là bắt buộc!");
showToast("✅ Đã gửi đề xuất công tác thành công!");
```

### ✅ AFTER (Using Translations)

```typescript
import { useTranslation } from "@/hooks/useTranslation";

export default function BusinessTripForm() {
  const { t } = useTranslation(); // Add this hook

  return (
    <form>
      <label className="text-xs font-bold text-slate-700 block">
        {t("business_trip.title")} <span className="text-rose-500">*</span>
      </label>

      <label className="text-xs font-bold text-slate-700 block">
        {t("business_trip.region")} <span className="text-rose-500">*</span>
      </label>

      <button onClick={handleSubmit}>
        {t("business_trip.submit_trip")}
      </button>

      {/* Validation messages */}
      showToast(`⚠️ ${t("validation.trip_name_required")}`);
      showToast(`⚠️ ${t("validation.region_required")}`);
      showToast(`✅ ${t("business_trip.trip_submitted_success")}`);
    </form>
  );
}
```

---

## Form Fields to Translate

### Row 1: Trip Title & Region

```typescript
// Region Label
t("business_trip.region")                    // "Khu vực" / "Region"

// Factory Label
t("business_trip.factory")                   // "Nhà máy" / "Factory"

// Creator Label  
t("business_trip.creator")                   // "Người tạo" / "Creator"
// Help text
t("business_trip.auto_from_current_account") // "Tự động từ tài khoản hiện tại" / "Auto from current account"

// Department Label
t("business_trip.department")                // "Bộ phận" / "Department"
// Help text
t("business_trip.auto_from_current_account") // "Tự động từ tài khoản hiện tại" / "Auto from current account"
```

### Row 2: Location & Transport

```typescript
// Location Label
t("business_trip.location")                  // "Công tác tại" / "Trip Location"

// Transport Label
t("business_trip.transport")                 // "Hình thức di chuyển" / "Transportation Method"
```

### Row 3: Dates & Cost

```typescript
// Start Date
t("business_trip.start_date")                // "Ngày bắt đầu" / "Start Date"

// End Date
t("business_trip.end_date")                  // "Ngày kết thúc" / "End Date"

// Number of Days
t("business_trip.num_days")                  // "Số ngày" / "Number of Days"

// Estimated Cost
t("business_trip.estimated_cost")            // "Chi phí dự kiến (VND)" / "Estimated Cost (VND)"
```

### Row 4: Purpose & Participants

```typescript
// Purpose
t("business_trip.purpose")                   // "Mục đích" / "Purpose"

// Participants
t("business_trip.participants")              // "Người tham gia" / "Participants"

// Add Participant Button
t("business_trip.add_participant")           // "Thêm người tham gia" / "Add Participant"
```

### Buttons

```typescript
// Submit Button
t("business_trip.submit_trip")               // "Gửi Đề Xuất Công Tác" / "Submit Trip Proposal"

// Submit Form Header
t("business_trip.trip_info")                 // "Thông tin chuyến công tác" / "Trip Information"
t("business_trip.traveler_info")             // "Thông tin người tham gia" / "Traveler Information"
```

### LIST Tab Filters

```typescript
// Region Filter Label
`${t("business_trip.region")}` + " filter"  // "Khu vực filter"

// Location Filter Label
`${t("business_trip.location")}` + " filter" // "Công tác tại filter"

// Status Filter Label
`${t("common.status")}`                      // "Trạng thái"

// Status Options
t("business_trip.status_pending")            // "Chờ duyệt" / "Pending"
t("business_trip.status_pending_l2")         // "Chờ Ban Giám Đốc" / "Pending Board Approval"
t("business_trip.status_approved")           // "Đã phê duyệt" / "Approved"
t("business_trip.status_rejected")           // "Bị từ chối" / "Rejected"
```

### Table Headers (LIST Tab)

```typescript
// Table columns
t("business_trip.region")                    // "Khu vực"
t("business_trip.title")                     // "Tên đề xuất"
t("business_trip.creator")                   // "Người tạo"
t("business_trip.location")                  // "Công tác tại"
t("business_trip.start_date")                // "Ngày bắt đầu"
t("business_trip.num_days")                  // "Số ngày"
t("business_trip.approval_status")           // "Trạng thái duyệt"
```

### Approval Buttons

```typescript
// Approve L1 Button
t("business_trip.approve_l1")                // "Duyệt Cấp 1" / "Approve Level 1"

// Approve L2 Button
t("business_trip.approve_l2")                // "Duyệt Cấp 2" / "Approve Level 2"

// Reject Button
t("business_trip.reject")                    // "Từ chối" / "Reject"
```

### Validation Error Messages

```typescript
// Validation messages to use in showToast()
t("validation.trip_name_required")           // "Tên đề xuất công tác là bắt buộc"
t("validation.region_required")              // "Khu vực là bắt buộc"
t("validation.factory_required")             // "Nhà máy là bắt buộc"
t("validation.location_required")            // "Công tác tại là bắt buộc"
t("validation.transport_required")           // "Hình thức di chuyển là bắt buộc"
t("validation.purpose_required")             // "Mục đích công tác là bắt buộc"
```

### Success Messages

```typescript
t("business_trip.trip_submitted_success")    // "Đã gửi đề xuất công tác thành công!"
t("messages.operation_successful")           // "Thao tác thành công"
```

---

## Code Change Example

### Before:
```typescript
// web/src/app/business-trip/page.tsx
showToast("⚠️ Tên đề xuất công tác là bắt buộc!");

<label>
  Tên đề xuất công tác <span className="text-rose-500">*</span>
</label>

<button>{t("business_trip.submit_trip")}</button>
```

### After:
```typescript
// web/src/app/business-trip/page.tsx
import { useTranslation } from "@/hooks/useTranslation";

export default function BusinessTripPage() {
  const { t } = useTranslation(); // Add at component top

  // In validation:
  showToast(`⚠️ ${t("validation.trip_name_required")}`);

  // In JSX:
  <label>
    {t("business_trip.title")} <span className="text-rose-500">*</span>
  </label>

  <button>{t("business_trip.submit_trip")}</button>
}
```

---

## Implementation Steps

1. **Add import at top of component:**
   ```typescript
   import { useTranslation } from "@/hooks/useTranslation";
   ```

2. **Initialize hook:**
   ```typescript
   const { t } = useTranslation();
   ```

3. **Replace hardcoded strings with `t()` calls:**
   ```typescript
   // Before
   <label>Region *</label>

   // After
   <label>{t("business_trip.region")} <span>*</span></label>
   ```

4. **Update validation messages:**
   ```typescript
   // Before
   showToast("❌ Region is required!");

   // After
   showToast(`❌ ${t("validation.region_required")}`);
   ```

5. **Update status displays:**
   ```typescript
   // Before
   <span>{rec.status}</span>

   // After
   <span>
     {rec.status === "PENDING" ? t("business_trip.status_pending") :
      rec.status === "APPROVED" ? t("business_trip.status_approved") :
      rec.status === "REJECTED" ? t("business_trip.status_rejected") :
      rec.status}
   </span>
   ```

---

## Testing Translation Integration

### Test in Browser:

```javascript
// 1. Check current language
localStorage.getItem("tbs_lang") // Should return "VN"

// 2. Switch to English
localStorage.setItem("tbs_lang", "ENG");
window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: "ENG" }));

// 3. Form should now show:
// "Business Trip Registration" instead of "Đăng Ký Công Tác"
// "Region" instead of "Khu vực"
// "Submit Trip Proposal" instead of "Gửi Đề Xuất Công Tác"

// 4. Switch back to Vietnamese
localStorage.setItem("tbs_lang", "VN");
window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: "VN" }));

// 5. Form should revert to Vietnamese text
```

---

## Summary

**What's Ready:**
✅ Translation system created  
✅ useTranslation hook created  
✅ LanguageSelector component existing  
✅ 80+ translation keys defined  
✅ Both VN and ENG translations provided  

**What Needs To Be Done:**
⏳ Update business-trip/page.tsx to use translations  
⏳ Update Header component navigation  
⏳ Update all validation messages  
⏳ Update all form labels  
⏳ Update all buttons  
⏳ Update all modals  
⏳ Build and test  
⏳ Deploy  

**Estimated Time**: 2-3 hours for complete integration

