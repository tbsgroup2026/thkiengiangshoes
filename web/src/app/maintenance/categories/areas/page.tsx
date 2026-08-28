'use client';

import CategoriesManager from '@/components/CategoriesManager';

export default function AreasPage() {
  return (
    <CategoriesManager
      tabKeys={['AREA', 'PRODUCTION_LINE', 'TEAM']}
      pageTitle="Quản Lý Khu Vực"
      pageSubtitle="Khu vực / Xưởng — Chuyền — Tổ — Tổ hợp Kiên Giang"
    />
  );
}
