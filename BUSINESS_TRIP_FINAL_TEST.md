# BUSINESS TRIP FORM - FINAL TEST RUN
**Date**: August 22, 2026  
**Build Status**: ✅ Exit Code 0 (Compiled Successfully)  
**Test Focus**: Region/Factory/Location dropdowns + Form submission

---

## TEST CHECKLIST

### Phase 1: Load Form
- [ ] Navigate to https://vpchuoiskechers.tbsgroup2026.workers.dev/business-trip
- [ ] Verify FORM tab loads successfully
- [ ] Check that region dropdown shows 6 options:
  - Kiên Giang 1
  - Kiên Giang 2
  - Kiên Giang 3
  - Hoàn Thiện Đế
  - Nhà Máy Miền Đông
  - VP Chuỗi (R&D)

### Phase 2: Test Region → Factory → Location Cascade
- [ ] Select "Kiên Giang 1" from region dropdown
  - [ ] Factory dropdown should show: "Nhà máy NK1 - Kiên Giang 1", "Nhà máy NK1A - Phụ lô"
  - [ ] Location dropdown should show: "Kiên Giang 1 - Cụm chính", "Kiên Giang 1 - Phân xưởng A"
  - [ ] Both should auto-select first option
- [ ] Select "Kiên Giang 2" from region dropdown
  - [ ] Factory should change to: "Nhà máy NK2 - Kiên Giang 2", "Nhà máy NK2 Mở rộng"
  - [ ] Location should change to: "Kiên Giang 2 - Cụm chính", "Kiên Giang 2 - Khu phụ trợ"
- [ ] Select "Hoàn Thiện Đế" from region dropdown
  - [ ] Factory should show: "Tổ hợp Đế Giày TTPP", "Xưởng Hoàn Thiện Đế"
  - [ ] Location should show: "Hoàn Thiện Đế - Khu TTPP", "Hoàn Thiện Đế - Kho thành phẩm"
- [ ] Test remaining regions: Kiên Giang 3, Nhà Máy Miền Đông, VP Chuỗi (R&D)

### Phase 3: Fill & Submit Form
- [ ] Fill form with test data:
  ```
  Tên đề xuất: Test Công Tác Kiên Giang 1
  Tháng / Năm: Current month/year
  Khu vực: Kiên Giang 1
  Nhà máy: Nhà máy NK1 - Kiên Giang 1
  Người tạo: Test User
  Bộ phận: Hành chính
  Công tác tại: Kiên Giang 1 - Cụm chính
  Hình thức di chuyển: Xe công ty
  Ngày bắt đầu: 2026-08-25
  Số ngày: 2
  Mục đích: Test công tác
  Địa chỉ: Kiên Giang 1
  ```
- [ ] Add at least 1 participant
- [ ] Click "Gửi Đề Xuất Công Tác"
- [ ] Verify success toast appears

### Phase 4: Verify in LIST Tab
- [ ] Switch to LIST tab
- [ ] Search for the submitted trip by name: "Test Công Tác Kiên Giang 1"
- [ ] Verify trip appears with:
  - Status: PENDING
  - Region: Kiên Giang 1
  - Location: Kiên Giang 1 - Cụm chính
  - Created date/time: current timestamp
- [ ] Click on trip row to view details
- [ ] Verify region/factory/location show correctly in modal

### Phase 5: Test Filter (LIST Tab)
- [ ] Use region filter to show only "Kiên Giang 1" trips
  - [ ] Newly submitted trip should appear
- [ ] Change filter to "Kiên Giang 2"
  - [ ] Trip should disappear from list
- [ ] Use location filter to filter by "Kiên Giang 1 - Cụm chính"
  - [ ] Trip should appear again
- [ ] Reset all filters
  - [ ] Trip should be visible in full list

### Phase 6: Edge Cases
- [ ] Try changing region to different options multiple times - factory/location should update each time
- [ ] Verify required fields validation (form should not allow submit with empty required fields)
- [ ] Check that factory dropdown always matches currently selected region

---

## EXPECTED OUTCOME
✅ All regions show correct factory/location hierarchies  
✅ Dropdowns auto-update when region changes  
✅ Form submits successfully with REGION_MAPPING data  
✅ LIST tab shows all 6 regions in filter  
✅ Filters work correctly with new region names  

---

## RESULTS
**Status**: [PENDING - TO BE TESTED]
**Tested By**: Agent
**Test Date**: TBD
**Issues Found**: TBD
