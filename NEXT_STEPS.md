# 🚀 Kaizen Modal - Next Steps & Roadmap

## ✅ Hoàn Thành (v2.0)

- ✅ Cập nhật modal UI để khớp thiết kế tham chiếu
- ✅ Thêm 3 sections rõ ràng (THÔNG TIN, NỘI DUNG, CHỤP ẢNH)
- ✅ Thêm 13+ trường dữ liệu chi tiết
- ✅ Implement 3-column layout (desktop responsive)
- ✅ Thêm image upload section
- ✅ Build test & TypeScript check: PASS
- ✅ Documentation (4 files)
- ✅ Git commit & push

---

## 📋 Immediately Next (v2.1 - Optional Enhancements)

### 1️⃣ Backend API Integration
**Status**: ⏳ Cần kiểm tra  
**Task**: Đảm bảo API endpoint `/api/ci-kaizen` xử lý tất cả 13+ trường mới

```typescript
// Check & Update: /api/ci-kaizen (POST)
// Fields needed:
- factory: string
- workplace: string
- shoeCode?: string
- bolNumber?: string
- bolProcessName?: string
- savedSeconds?: number
- beforeImageUrl?: string
- afterImageUrl?: string
```

**Action**:
- [ ] Review backend schema (Prisma model)
- [ ] Add migration if needed (new fields)
- [ ] Test API with new payload

---

### 2️⃣ Form Validation & Constraints
**Status**: ⏳ Có thể thêm  
**Task**: Thêm client-side validation cho các fields

```typescript
Validations:
- savedSeconds: must be >= 0
- beforeDescription: min 20 chars?
- afterSolution: min 30 chars?
- imageUrl: validate URL format
- workplace: max 100 chars
```

**Action**:
- [ ] Add form validation library (zod/yup)
- [ ] Implement client-side feedback
- [ ] Show error messages inline

---

### 3️⃣ Image Upload Enhancement
**Status**: ⏳ Recommended  
**Task**: Upgrade từ "paste URL" → Real file upload

**Current (v2.0)**:
```
User pastes image URL → Saved as string
```

**Improved (v2.1)**:
```
User uploads file → S3/Cloudinary → Get URL → Save
OR
User captures via camera → Compress → Upload → Save
```

**Action**:
- [ ] Setup Cloudinary SDK (or S3)
- [ ] Add file input handling
- [ ] Implement camera capture (mobile)
- [ ] Add progress indicator
- [ ] Error handling for failed uploads

**Code Location**: `src/modules/ci/CIModule.tsx` (section 3)

---

### 4️⃣ Auto-suggest BOL Process Name
**Status**: ⏳ Nice-to-have  
**Task**: Khi nhập BOL number → Auto-fill Tên Công Đoạn

```typescript
// When user enters BOL number (e.g., "BOL-001")
// Fetch from DB → Auto-fill "Phun keo lót giày"

<input 
  value={bolNumber}
  onChange={handleBolChange} // Trigger API call
/>
```

**Action**:
- [ ] Create API endpoint: GET `/api/bols/:bolNumber`
- [ ] Implement debounced search
- [ ] Show loading state
- [ ] Handle not found

---

## 🔄 Phase 2 (v3.0 - Major Features)

### 5️⃣ QR Code Scanning
**Status**: 📅 Future (Nice-to-have)  
**Description**: Nút "Quét QR Code" ở modal header (matching reference design)

```tsx
<button>
  📱 Quét QR Code
  // Opens camera to scan BOL/Product QR
  // Auto-fills relevant fields
</button>
```

**Benefits**:
- Faster data entry
- Reduced errors
- Mobile-friendly

**Technology**:
- html5-qrcode library OR
- jsQR library

---

### 6️⃣ Draft Saving & Auto-save
**Status**: 📅 Future  
**Description**: Auto-save form progress to localStorage

```typescript
// Auto-save every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    localStorage.setItem('kaizen_draft', JSON.stringify(createForm));
  }, 30000);
  
  return () => clearInterval(interval);
}, [createForm]);

// On page load, restore draft
useEffect(() => {
  const draft = localStorage.getItem('kaizen_draft');
  if (draft) {
    // Restore form
    setCreateForm(JSON.parse(draft));
    // Show "Restore draft?" notification
  }
}, []);
```

**UX**:
- "Restore unsaved draft?" popup
- Save indicator ("Saving...")
- Clear draft button after submit

---

### 7️⃣ Rich Text Editor for Descriptions
**Status**: 📅 Future (Optional)  
**Description**: Upgrade textarea → Rich text editor (bold, lists, etc.)

```tsx
// Current: Plain textarea
<textarea value={createForm.beforeDescription} />

// Future: Rich text
import { Editor } from '@tinymce/tinymce-react';

<Editor
  value={createForm.beforeDescription}
  onEdited={handleChange}
/>
```

**Benefits**:
- Better formatting
- Lists & bullets
- Copy-paste from Word

---

### 8️⃣ Template / Quick Start
**Status**: 📅 Future  
**Description**: Pre-filled templates untuk thường gặp issues

```tsx
<select onChange={handleTemplate}>
  <option value="">-- Chọn Template --</option>
  <option value="phun_keo">Phun Keo Lót Giày</option>
  <option value="dong_hop">Đóng Hộp</option>
  <option value="5s">5S Kaizen</option>
</select>

// Auto-fills: Category, Process, Description suggestions
```

---

## 🧪 Testing Checklist (v2.1+)

- [ ] Unit tests for form validation
- [ ] Integration tests for API submission
- [ ] E2E tests (Cypress/Playwright)
  - [ ] Open modal
  - [ ] Fill all fields
  - [ ] Submit form
  - [ ] Verify success toast
- [ ] Mobile responsive tests
- [ ] Browser compatibility (Chrome, Firefox, Safari)
- [ ] Accessibility audit (a11y)
  - [ ] WCAG 2.1 AA
  - [ ] Keyboard navigation
  - [ ] Screen reader test

---

## 📱 Mobile & Accessibility (v2.1+)

### Mobile Improvements
- [ ] Larger touch targets for buttons (min 44×44px)
- [ ] Mobile-optimized font sizes
- [ ] Full-screen modal on mobile (better UX)
- [ ] Sticky buttons on scroll

### Accessibility
- [ ] Proper ARIA labels
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Focus indicators
- [ ] Form error announcement
- [ ] Alt text for images

---

## 📊 Performance & Analytics (v2.1+)

### Tracking
- [ ] Track form submission success/error rate
- [ ] Track field population rate (which fields users fill)
- [ ] Track form completion time
- [ ] Track modal open/close events

### Optimization
- [ ] Lazy load image upload library
- [ ] Optimize validation (debounce input handlers)
- [ ] Cache BOL lookup results

---

## 🐛 Known Issues & Workarounds

### Current (v2.0)
1. **Image URLs**: User must paste valid URL (no file upload yet)
   - Workaround: Use Cloudinary URL or image hosting
   - Fix in: v2.1 with real file upload

2. **BOL auto-fill**: Manual text entry only
   - Workaround: Copy from machine display
   - Fix in: v2.1 with API integration

3. **No draft save**: Data lost if tab closed
   - Workaround: Keep browser tab open
   - Fix in: v3.0 with localStorage

---

## 💻 Technical Debt

- [ ] Reduce CIModule.tsx file size (too large, consider splitting)
- [ ] Extract modal components to separate files
- [ ] Create reusable form field components
- [ ] Add proper error boundaries
- [ ] Setup form state management (React Hook Form or Formik)

---

## 📞 Questions for Product Team

1. **QR Code Scanning**: Do we want to implement in v2.1 or later?
2. **File Upload**: Should we use Cloudinary, S3, or internal storage?
3. **BOL Lookup**: Is BOL database available for API integration?
4. **Draft Saving**: Do users need to save drafts (offline support)?
5. **Template**: Common Kaizen categories we should pre-fill?

---

## 🎯 Priority Matrix

```
HIGH IMPACT, LOW EFFORT:
  - Backend validation ✅
  - Form error handling
  - Image file upload
  - BOL auto-suggest

MEDIUM IMPACT, MEDIUM EFFORT:
  - QR code scanning
  - Draft auto-save
  - Mobile improvements

LOW IMPACT or HIGH EFFORT:
  - Rich text editor
  - Template system
  - Advanced analytics
```

---

## 📅 Estimated Timeline

```
v2.1 (2 weeks):
  - Week 1: Backend API validation + form error handling
  - Week 2: Image file upload + BOL auto-suggest
  - Testing & QA

v2.2 (1 week):
  - Mobile polish
  - Accessibility audit
  - Browser testing

v3.0 (3 weeks):
  - QR code scanning
  - Draft saving
  - Advanced features
```

---

## ✨ Success Metrics

When these are implemented, success = when:
- Form submission rate increases (users complete & submit)
- Error rate decreases (validation prevents mistakes)
- Time-to-complete decreases (faster entry with auto-fill)
- Mobile completion rate increases (mobile-optimized)
- User satisfaction score increases (in surveys)

---

## 📝 Documentation

Files to create/update:
- [ ] API documentation (new fields)
- [ ] User manual (updated)
- [ ] Developer guide (form architecture)
- [ ] Release notes

---

**Last Updated**: 21/08/2026  
**Current Version**: 2.0  
**Next Milestone**: 2.1 (Backend Integration)  
**Owner**: Kiro Agent / Development Team
