import React from "react";
import JobDetailClient from "./JobDetailClient";

export const dynamicParams = false;

// Pre-generate static pages for known job IDs
export async function generateStaticParams() {
  return [
    { id: "sample-job-1" },
    { id: "sample-job-2" },
    { id: "sample-job-3" },
  ];
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailClient id={id} />;
}
