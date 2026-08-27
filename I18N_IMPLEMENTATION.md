# Multi-Language (i18n) Implementation Guide
**Date**: August 22, 2026  
**Status**: ✅ Ready to Use  
**Supported Languages**: Vietnamese (VN) & English (ENG)

---

## 📁 Files Created

1. **`web/src/lib/translations.ts`** - Main translation dictionary
2. **`web/src/hooks/useTranslation.ts`** - React hook for using translations
3. **`web/src/components/LanguageSelector.tsx`** - Already exists, now fully integrated

---

## 🚀 How to Use

### Method 1: In React Components (Recommended)

```typescript
"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function MyComponent() {
  const { t, lang, setLang } = useTranslation();

  return (
    <div>
      {/* Display translated text */}
      <h1>{t("common.save")}</h1>
      <button>{t("business_trip.submit_trip")}</button>

      {/* Switch language */}
      <button onClick={() => setLang("ENG")}>
        English
      </button>
      <button onClick={() => setLang("VN")}>
        Tiếng Việt
      </button>

      {/* Show current language */}
      <p>Current: {lang}</p>
    </div>
  );
}
```

### Method 2: Direct Function (Non-React)

```typescript
import { translate, getCurrentLanguage } from "@/lib/translations";

const currentLang = getCurrentLanguage(); // "VN" or "ENG"
const text = translate("common.save", currentLang); // "Lưu" or "Save"
```

### Method 3: With Fallback

```typescript
const { t } = useTranslation();
const text = t("common.save", "Save as Fallback");
```

---

## 📖 Available Translation Keys

### Common (UI Buttons)
```typescript
t("common.save")        // Lưu / Save
t("common.cancel")      // Hủy / Cancel
t("common.delete")      // Xóa / Delete
t("common.edit")        // Chỉnh sửa / Edit
t("common.submit")      // Gửi / Submit
t("common.loading")     // Đang tải... / Loading...
t("common.error")       // Lỗi / Error
t("common.success")     // Thành công / Success
```

### Navigation
```typescript
t("nav.home")                       // Trang Chủ / Home
t("nav.management_system")          // Hệ Thống Quản Trị / Management System
t("nav.recruitment")                // Tuyển Dụng / Recruitment
t("nav.faq")                         // Câu Hỏi Thường Gặp (FAQ) / FAQ
```

### Business Trip Module
```typescript
t("business_trip.title")             // Đăng Ký Công Tác / Business Trip Registration
t("business_trip.region")            // Khu Vực / Region
t("business_trip.factory")           // Nhà Máy / Factory
t("business_trip.location")          // Công Tác Tại / Trip Location
t("business_trip.creator")           // Người Tạo / Creator
t("business_trip.department")        // Bộ Phận / Department
t("business_trip.transport")         // Hình Thức Di Chuyển / Transportation Method
t("business_trip.purpose")           // Mục Đích / Purpose
t("business_trip.submit_trip")       // Gửi Đề Xuất Công Tác / Submit Trip Proposal
t("business_trip.approve_l1")        // Duyệt Cấp 1 / Approve Level 1
t("business_trip.approve_l2")        // Duyệt Cấp 2 / Approve Level 2
t("business_trip.status_pending")    // Chờ Duyệt / Pending
t("business_trip.status_approved")   // Đã Phê Duyệt / Approved
t("business_trip.status_rejected")   // Bị Từ Chối / Rejected
```

### Validation Messages
```typescript
t("validation.required_field")       // Trường này là bắt buộc / This field is required
t("validation.trip_name_required")   // Tên đề xuất công tác là bắt buộc / Trip name is required
t("validation.region_required")      // Khu vực là bắt buộc / Region is required
t("validation.factory_required")     // Nhà máy là bắt buộc / Factory is required
t("validation.purpose_required")     // Mục đích công tác là bắt buộc / Purpose is required
```

### User Profile
```typescript
t("profile.personal_info")           // Thông tin cá nhân / Personal Information
t("profile.change_password")         // Đổi mật khẩu / Change Password
t("profile.logout")                  // Đăng xuất / Logout
t("profile.email")                   // Email / Email
t("profile.phone")                   // Số điện thoại / Phone Number
t("profile.department")              // Bộ phận / Department
```

### Messages
```typescript
t("messages.welcome")                // Chào mừng bạn! / Welcome!
t("messages.loading_data")           // Đang tải dữ liệu... / Loading data...
t("messages.confirm_delete")         // Bạn có chắc chắn muốn xóa? / Are you sure?
t("messages.operation_successful")   // Thao tác thành công / Operation successful
t("messages.network_error")          // Lỗi kết nối mạng / Network error
```

---

## 🔄 How It Works

### 1. Language Selection Flow
```
User clicks language button (VN/ENG)
    ↓
LanguageSelector component saves to localStorage
    ↓
Dispatches "tbs_lang_changed" event
    ↓
useTranslation hook listens and updates
    ↓
Components re-render with new language
```

### 2. Translation Storage
- Language preference saved in `localStorage.tbs_lang`
- Persists across page refreshes and sessions
- Default language: Vietnamese (VN)

### 3. Event System
```typescript
// Triggered when language changes
window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: "ENG" }));

// Listen for changes
window.addEventListener("tbs_lang_changed", (e: CustomEvent) => {
  console.log("Language changed to:", e.detail);
});
```

---

## 📝 Usage Examples

### Example 1: Business Trip Form
```typescript
"use client";
import { useTranslation } from "@/hooks/useTranslation";

export function TripForm() {
  const { t } = useTranslation();

  return (
    <form>
      <label>{t("business_trip.title")}</label>
      
      <div>
        <label>{t("business_trip.region")} <span>*</span></label>
        <select>
          <option>Kiên Giang 1</option>
        </select>
      </div>

      <div>
        <label>{t("business_trip.purpose")} <span>*</span></label>
        <input placeholder={t("business_trip.purpose")} />
      </div>

      <button type="submit">
        {t("business_trip.submit_trip")}
      </button>
    </form>
  );
}
```

### Example 2: Validation Messages
```typescript
const { t } = useTranslation();

if (!form.title) {
  showToast(`⚠️ ${t("validation.trip_name_required")}`);
}

if (!form.region) {
  showToast(`⚠️ ${t("validation.region_required")}`);
}
```

### Example 3: Status Badges
```typescript
function StatusBadge({ status }) {
  const { t } = useTranslation();
  
  const statusText = {
    PENDING: t("business_trip.status_pending"),
    APPROVED: t("business_trip.status_approved"),
    REJECTED: t("business_trip.status_rejected"),
  }[status];

  return <span>{statusText}</span>;
}
```

### Example 4: Dropdowns
```typescript
function TripListFilters() {
  const { t } = useTranslation();

  return (
    <select>
      <option>{t("business_trip.status_pending")}</option>
      <option>{t("business_trip.status_approved")}</option>
      <option>{t("business_trip.status_rejected")}</option>
    </select>
  );
}
```

---

## 🔧 Adding New Translations

### Step 1: Update `translations.ts`
```typescript
const TRANSLATIONS: Record<LanguageCode, Translations> = {
  VN: {
    // ... existing
    new_feature: {
      button_text: "Văn bản nút",
      label: "Nhãn mới",
      description: "Mô tả tính năng",
    },
  },
  ENG: {
    // ... existing
    new_feature: {
      button_text: "Button text",
      label: "New label",
      description: "Feature description",
    },
  },
};
```

### Step 2: Update `Translations` Interface
```typescript
export interface Translations {
  // ... existing
  new_feature: {
    button_text: string;
    label: string;
    description: string;
  };
}
```

### Step 3: Use in Components
```typescript
const { t } = useTranslation();
<button>{t("new_feature.button_text")}</button>
```

---

## 🎯 Current Implementation Status

- ✅ Translation files created
- ✅ useTranslation hook created
- ✅ LanguageSelector component ready
- ⏳ Components need to be updated to use translations
- ⏳ Business trip form ready for translation
- ⏳ Header navigation ready for translation

---

## 📋 Integration Checklist

- [ ] Update Header component to use translations
- [ ] Update Business Trip form to use translations
- [ ] Update List table headers to use translations
- [ ] Update validation messages to use translations
- [ ] Update navigation links to use translations
- [ ] Update modal titles and buttons to use translations
- [ ] Test language switching
- [ ] Test localStorage persistence
- [ ] Build and deploy

---

## 🧪 Testing Language Switching

### In Browser Console:
```javascript
// Check current language
localStorage.getItem("tbs_lang")

// Manually switch language
localStorage.setItem("tbs_lang", "ENG");
window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: "ENG" }));

// Switch back to Vietnamese
localStorage.setItem("tbs_lang", "VN");
window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: "VN" }));
```

### In Components:
```typescript
// Add debug component to verify translations
function DebugTranslations() {
  const { t, lang, setLang } = useTranslation();

  return (
    <div>
      <p>Current Language: {lang}</p>
      <button onClick={() => setLang("ENG")}>Switch to ENG</button>
      <button onClick={() => setLang("VN")}>Switch to VN</button>
      <p>{t("business_trip.title")}</p>
      <p>{t("common.save")}</p>
    </div>
  );
}
```

---

## 📊 Translation Statistics

**Total Translation Keys**: 80+
- Common: 20 keys
- Navigation: 8 keys
- Business Trip: 20 keys
- Validation: 10 keys
- Profile: 10 keys
- Messages: 12 keys

**Languages Supported**: 2 (Vietnamese, English)

---

## 🚀 Next Steps

1. **Update Business Trip Form** to use `useTranslation()` hook
2. **Update Header** navigation labels
3. **Update Validation Messages** to be dynamic
4. **Update Status Badges** and dropdowns
5. **Build and Deploy**
6. **Test language switching** in production

---

## 💡 Best Practices

✅ **DO:**
- Use `t()` function instead of hardcoded strings
- Keep translation keys organized by feature
- Use dot notation for nested keys
- Provide fallback values when needed
- Test in both languages

❌ **DON'T:**
- Mix translated and hardcoded strings
- Create new translation keys without adding to both VN and ENG
- Use HTML/JSX inside translation strings (use variables instead)
- Forget to handle language-dependent formatting (dates, numbers)

---

## 📞 Support

For questions or to add new translations, refer to:
- `web/src/lib/translations.ts` - Main translation dictionary
- `web/src/hooks/useTranslation.ts` - Hook documentation
- Examples above for implementation patterns

---

**Status**: ✅ Ready for Implementation  
**Build Status**: ✅ No changes needed (new files only)  
**Deployment**: ✅ Can deploy immediately
