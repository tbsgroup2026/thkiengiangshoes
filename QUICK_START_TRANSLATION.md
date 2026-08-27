# 🌐 Translation System - Quick Start (5 Minutes)

## ⚡ In 5 Minutes, You Can:

### 1️⃣ Use Translations in Any Component (1 min)

```typescript
import { useTranslation } from "@/hooks/useTranslation";

export function MyForm() {
  const { t } = useTranslation();

  return (
    <form>
      <h1>{t("business_trip.title")}</h1>
      <button>{t("common.save")}</button>
    </form>
  );
}
```

### 2️⃣ Switch Languages at Runtime (1 min)

```typescript
const { setLang } = useTranslation();

// Switch to English
<button onClick={() => setLang("ENG")}>English</button>

// Switch to Vietnamese
<button onClick={() => setLang("VN")}>Tiếng Việt</button>
```

### 3️⃣ Use Dynamic Messages (1 min)

```typescript
const { t } = useTranslation();

// Validation
if (!form.region) {
  showToast(`⚠️ ${t("validation.region_required")}`);
}

// Status displays
<span>{t(`business_trip.status_${status.toLowerCase()}`)}</span>

// Button labels
<button>{t("business_trip.submit_trip")}</button>
```

### 4️⃣ Test in Browser (2 min)

```javascript
// Test 1: Check current language
localStorage.getItem("tbs_lang") // Returns: "VN"

// Test 2: Switch to English
localStorage.setItem("tbs_lang", "ENG");
window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: "ENG" }));

// Test 3: See the form change to English!
// "Khu vực" → "Region"
// "Gửi Đề Xuất" → "Submit Proposal"

// Test 4: Switch back
localStorage.setItem("tbs_lang", "VN");
window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: "VN" }));
```

---

## 📖 20 Most Common Translation Keys

```typescript
// Buttons
t("common.save")           // "Lưu" / "Save"
t("common.cancel")         // "Hủy" / "Cancel"
t("common.delete")         // "Xóa" / "Delete"
t("common.submit")         // "Gửi" / "Submit"

// Business Trip
t("business_trip.title")   // "Đăng Ký Công Tác" / "Business Trip Registration"
t("business_trip.region")  // "Khu Vực" / "Region"
t("business_trip.factory") // "Nhà Máy" / "Factory"
t("business_trip.location") // "Công Tác Tại" / "Trip Location"
t("business_trip.submit_trip") // "Gửi Đề Xuất Công Tác" / "Submit Trip Proposal"
t("business_trip.approve_l1")  // "Duyệt Cấp 1" / "Approve Level 1"
t("business_trip.approve_l2")  // "Duyệt Cấp 2" / "Approve Level 2"

// Status
t("business_trip.status_pending")  // "Chờ Duyệt" / "Pending"
t("business_trip.status_approved") // "Đã Phê Duyệt" / "Approved"
t("business_trip.status_rejected") // "Bị Từ Chối" / "Rejected"

// Validation
t("validation.required_field")     // "Trường này là bắt buộc" / "Required"
t("validation.trip_name_required") // "Tên đề xuất công tác là bắt buộc" / "Trip name required"
t("validation.region_required")    // "Khu vực là bắt buộc" / "Region required"
```

---

## 🎨 Usage Patterns

### Pattern 1: Form Labels
```typescript
<label>{t("business_trip.region")} <span>*</span></label>
<input placeholder={t("business_trip.purpose")} />
```

### Pattern 2: Error Messages
```typescript
if (!form.title) {
  showToast(`❌ ${t("validation.trip_name_required")}`);
}
```

### Pattern 3: Button Text
```typescript
<button>{t("common.submit")}</button>
<button>{t("business_trip.approve_l1")}</button>
```

### Pattern 4: Dropdowns
```typescript
<option>{t("business_trip.status_pending")}</option>
<option>{t("business_trip.status_approved")}</option>
```

### Pattern 5: Conditional Status
```typescript
const statusText = {
  PENDING: t("business_trip.status_pending"),
  APPROVED: t("business_trip.status_approved"),
  REJECTED: t("business_trip.status_rejected"),
}[status];
<span>{statusText}</span>
```

---

## 🔧 Copy-Paste Ready Code Blocks

### Block 1: Add Hook to Component
```typescript
import { useTranslation } from "@/hooks/useTranslation";

export function YourComponent() {
  const { t, lang, setLang } = useTranslation();
  
  // Use t() to translate any key
  return <h1>{t("business_trip.title")}</h1>;
}
```

### Block 2: Language Switcher
```typescript
const { setLang } = useTranslation();

<div className="flex gap-2">
  <button onClick={() => setLang("VN")}>VN</button>
  <button onClick={() => setLang("ENG")}>ENG</button>
</div>
```

### Block 3: Validation with Translation
```typescript
const { t } = useTranslation();

const handleSubmit = async () => {
  if (!form.title) {
    showToast(`⚠️ ${t("validation.trip_name_required")}`);
    return;
  }
  if (!form.region) {
    showToast(`⚠️ ${t("validation.region_required")}`);
    return;
  }
  // ... continue
};
```

### Block 4: Status Display Component
```typescript
function StatusBadge({ status }) {
  const { t } = useTranslation();
  
  const statusMap = {
    PENDING: t("business_trip.status_pending"),
    APPROVED: t("business_trip.status_approved"),
    REJECTED: t("business_trip.status_rejected"),
  };
  
  return <span className="badge">{statusMap[status]}</span>;
}
```

---

## 🎯 Integration Checklist

Pick one and start:

### Option A: Business Trip Form (Easiest - 30 min)
- [ ] Add `import { useTranslation }` to business-trip/page.tsx
- [ ] Add `const { t } = useTranslation();` to component
- [ ] Replace all form labels with `{t("business_trip.field_name")}`
- [ ] Replace validation messages with `${t("validation.message_name")}`
- [ ] Replace button labels with `{t("business_trip.action_name")}`
- [ ] Test in browser

### Option B: Header Navigation (Medium - 45 min)
- [ ] Add useTranslation hook to Header.tsx
- [ ] Replace nav links with `{t("nav.link_name")}`
- [ ] Replace dropdown menu labels
- [ ] Replace user menu items

### Option C: Full App Integration (Complete - 2-3 hours)
- [ ] Do Option A (Business Trip)
- [ ] Do Option B (Header)
- [ ] Update all modals
- [ ] Update all status displays
- [ ] Update all form validations
- [ ] Test everything
- [ ] Deploy

---

## 🚀 Deploy Anytime

The translation system:
- ✅ Works immediately (no setup needed)
- ✅ Has no breaking changes
- ✅ Can be added gradually
- ✅ Doesn't affect existing code
- ✅ Can deploy without using it yet

**Translation system is ready to use RIGHT NOW!**

---

## 📞 Stuck?

**Q: Where is the translation file?**
A: `web/src/lib/translations.ts` - Contains all 80+ keys in VN and ENG

**Q: How do I add a new language?**
A: Add new language code to `TRANSLATIONS` object in `translations.ts`

**Q: Does it work with TypeScript?**
A: Yes! Full TypeScript support with proper types

**Q: Can users save their language preference?**
A: Yes! Automatically saves to localStorage

**Q: Will it slow down my app?**
A: No! Negligible performance impact (<1ms)

**Q: What if a translation key is missing?**
A: It returns the key name as fallback (e.g., "common.save")

---

## 💡 Pro Tips

✅ **Always import at component top:**
```typescript
import { useTranslation } from "@/hooks/useTranslation";
```

✅ **Use in JSX directly:**
```typescript
<button>{t("common.save")}</button>  // ✅ Good
<button>{"t(" + 'common.save' + ")"}</button>  // ❌ Wrong
```

✅ **For conditional text, prepare first:**
```typescript
const labels = {
  save: t("common.save"),
  delete: t("common.delete"),
};
return <button>{labels.save}</button>;  // ✅ Better
```

✅ **Keep translations simple:**
```typescript
t("common.save")  // ✅ Good - one key per translation
t("common.save_and_close")  // ✅ Also good
```

---

## 🎊 You're Ready!

Everything is set up. Just:

1. **Pick a component** (or start with business trip form)
2. **Add the hook** to the component
3. **Replace strings** with `t()` calls
4. **Test in browser** (use VN/ENG switcher)
5. **Deploy** when ready

That's it! 🚀

---

**Start now or ask questions in the documentation!**

See full docs in:
- `I18N_IMPLEMENTATION.md` - Complete reference
- `TRANSLATION_INTEGRATION_EXAMPLE.md` - Step-by-step guide
