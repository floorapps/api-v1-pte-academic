"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const categories = ["speaking", "writing", "reading", "listening"] as const;
const examTypes = ["academic", "core"] as const;

export function PracticeFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentCategory = (searchParams.get("category") || "reading").toLowerCase();
  const currentType = (searchParams.get("type") || "academic").toLowerCase();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Exam Type */}
      <div>
        <h3 className="text-sm font-medium mb-2">Exam Type</h3>
        <div className="inline-flex rounded-md border bg-white overflow-hidden">
          {examTypes.map((t) => (
            <button
              key={t}
              onClick={() => setParam("type", t)}
              className={cn(
                "px-4 py-2 text-sm capitalize",
                currentType === t ? "bg-orange-500 text-white" : "hover:bg-gray-100"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setParam("category", c)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm capitalize",
              currentCategory === c
                ? "bg-orange-100 text-orange-700 border border-orange-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
