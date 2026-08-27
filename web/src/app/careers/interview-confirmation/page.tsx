import React, { Suspense } from "react";
import InterviewConfirmationClient from "./InterviewConfirmationClient";

export default function InterviewConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Đang tải...</p>
        </div>
      </div>
    }>
      <InterviewConfirmationClient />
    </Suspense>
  );
}
