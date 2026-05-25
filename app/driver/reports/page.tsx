"use client";

import { Suspense } from "react";
import { MyReportsView } from "@/components/reports/MyReportsView";

export default function DriverReportsPage() {
  return (
    <Suspense fallback={null}>
      <MyReportsView />
    </Suspense>
  );
}
