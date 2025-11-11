import { ScoreBreakdownTable } from "@/components/pte/score-breakdown-table";
import { Suspense } from "react";

export const metadata = {
  title: "PTE Score Breakdown | Question Types & Score Information",
  description: "Comprehensive breakdown of PTE Academic question types, timing, and score contributions",
};

export default function ScoreBreakdownPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading score breakdown...</p>
          </div>
        </div>
      }>
        <ScoreBreakdownTable />
      </Suspense>
    </div>
  );
}

