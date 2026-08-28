'use client';

import CategoriesManager from '@/components/CategoriesManager';

export default function PartsPage() {
  return (
    <CategoriesManager
      tabKeys={['PART']}
      pageTitle="Phụ Tùng / Linh Kiện"
      pageSubtitle="Danh mục phụ tùng/linh kiện tồn kho — Tổ hợp Kiên Giang"
    />
  );
}
