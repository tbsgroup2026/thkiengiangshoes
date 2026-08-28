'use client';

import CategoriesManager from '@/components/CategoriesManager';

export default function MachineStatusPage() {
  return (
    <CategoriesManager
      tabKeys={['MACHINE_STATUS']}
      pageTitle="Trạng Thái Máy"
      pageSubtitle="Danh mục trạng thái máy — Tổ hợp Kiên Giang"
    />
  );
}
