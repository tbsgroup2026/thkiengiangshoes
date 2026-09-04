import React, { Suspense } from 'react';
import PphScanClient from './PphScanClient';

export default function PphScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f5]">
          <div className="w-8 h-8 rounded-full border-4 border-[#006838] border-t-transparent animate-spin" />
        </div>
      }
    >
      <PphScanClient />
    </Suspense>
  );
}
