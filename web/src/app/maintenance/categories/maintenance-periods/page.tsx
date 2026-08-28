'use client';

import CategoriesManager from '@/components/CategoriesManager';

export default function MaintenancePeriodsPage() {
  return (
    <CategoriesManager
      tabKeys={['MAINTENANCE_PERIOD']}
      pageTitle="Chu Kỳ Bảo Trì"
      pageSubtitle="Danh mục chu kỳ bảo trì định kỳ — Tổ hợp Kiên Giang"
    />
  );
}
