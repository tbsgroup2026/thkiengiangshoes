'use client';

import CategoriesManager from '@/components/CategoriesManager';

export default function MachineTypesPage() {
  return (
    <CategoriesManager
      tabKeys={['MACHINE_TYPE']}
      pageTitle="Phân Loại Máy"
      pageSubtitle="Danh mục phân loại máy — Tổ hợp Kiên Giang"
    />
  );
}
