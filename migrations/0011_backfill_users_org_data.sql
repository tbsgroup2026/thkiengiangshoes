-- Migration 0011: Strict Rule-Based Org Mapping (Zero Dummy Data Fallback)

-- 1. ĐẾ / HTCN Đế -> HTĐ KG
UPDATE users 
SET factory_id = 'HTĐ KG',
    workshop_id = 'Xưởng Hoàn Thiện Đế',
    line_id = 'Line Sơn & Ép',
    chuyen_id = 'Chuyền Ép Thành Phẩm',
    to_id = 'Tổ Ép Đế 1',
    vtcv = COALESCE(vtcv_hien_tai, vtcv_sap, title, 'Công Nhân Sản Xuất')
WHERE department LIKE '%ĐẾ%' OR department LIKE '%HTCN_GIÀY/ĐẾ%' OR department LIKE '%QKEO MŨ - ĐẾ%' OR department LIKE '%RÁP ĐẾ%' OR department LIKE '%DÁN ĐẾ%';

-- 2. MAY MŨ / CHẶT / LẠNG -> KG 1 (Xưởng Mũi KG1)
UPDATE users 
SET factory_id = 'KG 1',
    workshop_id = 'Xưởng Mũi KG1',
    line_id = 'Line May Mũi 1',
    chuyen_id = 'Chuyền May 1',
    to_id = 'Tổ May 1A',
    vtcv = COALESCE(vtcv_hien_tai, vtcv_sap, title, 'Công Nhân Sản Xuất')
WHERE department LIKE '%MAY%' OR department LIKE '%MŨ%' OR department LIKE '%CHẶT%' OR department LIKE '%LẠNG%' OR department LIKE '%IN LỤA%' OR department LIKE '%THÊU%';

-- 3. GÒ / PACKING -> KG 1 (Xưởng Gò KG1)
UPDATE users 
SET factory_id = 'KG 1',
    workshop_id = 'Xưởng Gò KG1',
    line_id = 'Line Gò Thành Phẩm',
    chuyen_id = 'Chuyền Gò 1',
    to_id = 'Tổ Gò 1A',
    vtcv = COALESCE(vtcv_hien_tai, vtcv_sap, title, 'Công Nhân Sản Xuất')
WHERE department LIKE '%GÒ%' OR department LIKE '%PACKING%';

-- 4. R&D / MẪU / THIẾT KẾ / KD PTSP -> VP2 (Văn Phòng Chuỗi SKECHERS -> vtcv = 'CBNVVP')
UPDATE users 
SET factory_id = 'VP2',
    workshop_id = 'Văn Phòng Chuỗi SKECHERS',
    line_id = 'Khối R&D & Thiết Kế',
    chuyen_id = 'Chuyền Mẫu',
    to_id = 'Tổ Làm Mẫu 1',
    vtcv = 'CBNVVP'
WHERE department LIKE '%MẪU%' OR department LIKE '%THIẾT KẾ%' OR department LIKE '%R&D%' OR department LIKE '%PTSP%' OR department LIKE '%ODM%';

-- 5. VĂN PHÒNG / KHO / KẾ TOÁN / NHÂN SỰ / BẢO TRÌ -> VP KV KG (vtcv = 'CBNVVP')
UPDATE users 
SET factory_id = 'VP KV KG',
    workshop_id = 'Văn Phòng Khu Vực',
    line_id = 'Khối Kỹ Thuật & CI',
    chuyen_id = 'Chuyền CI',
    to_id = 'Tổ Kaizen 1',
    vtcv = 'CBNVVP'
WHERE department LIKE '%KẾ TOÁN%' OR department LIKE '%NHÂN SỰ%' OR department LIKE '%HÀNH CHÍNH%' OR department LIKE '%LỄ TÂN%' OR department LIKE '%LÁI XE%' OR department LIKE '%KHO%' OR department LIKE '%BẢO TRÌ%' OR department LIKE '%LẬP TRÌNH%';
