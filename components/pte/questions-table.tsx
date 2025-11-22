"use client";

import Link from "next/link";
import { AlertCircle, Bookmark, CheckCircle2, Circle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuestionRow {
  id: string;
  title?: string | null;
  difficulty?: string | null;
  practicedCount?: number;
  tags?: string[] | null;
}

interface QuestionsTableProps {
  rows: QuestionRow[];
  section?: "speaking" | "reading" | "writing" | "listening";
  questionType?: string;
}

function capitalize(s?: string | null): string {
  if (!s) return "Medium";
  const lower = String(s).toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function difficultyVariant(d: string): "default" | "secondary" | "destructive" {
  const v = d.toLowerCase();
  if (v === "hard") return "destructive";
  if (v === "easy") return "secondary";
  return "default";
}

export default function QuestionsTable({
  rows,
  section,
  questionType,
}: QuestionsTableProps) {
  const isEmpty = rows.length === 0;

  return (
    <div className="rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[60%]">Title</TableHead>
            <TableHead className="w-32 text-center">Difficulty</TableHead>
            <TableHead className="w-32 text-center">Status</TableHead>
            <TableHead className="w-32 text-right">Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isEmpty ? (
            <TableRow>
              <TableCell colSpan={4} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      No questions available
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Questions for this section will be available soon.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => {
              const id = row.id;
              const title = row.title || "Question";
              const diff = capitalize(row.difficulty ?? "medium");
              const practiced = (row.practicedCount ?? 0) > 0;

              // Difficulty badge colors
              const badgeVariant =
                diff === "Hard" ? "destructive" :
                  diff === "Easy" ? "secondary" : "default";

              const badgeColor =
                diff === "Hard" ? "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400" :
                  diff === "Easy" ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" :
                    "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";

              return (
                <TableRow key={id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono text-xs w-6 text-right">{index + 1}.</span>
                      {section && questionType ? (
                        <Link
                          href={`/pte/academic/practice/${section}/${questionType}/question/${id}`}
                          className="text-foreground hover:text-primary hover:underline decoration-primary/30 underline-offset-4 transition-colors"
                        >
                          {title.length > 80
                            ? `${title.slice(0, 80)}...`
                            : title}
                        </Link>
                      ) : (
                        <span>
                          {title.length > 80
                            ? `${title.slice(0, 80)}...`
                            : title}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`border-0 font-normal ${badgeColor}`}>
                      {diff}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {practiced ? (
                      <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                          <Circle className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-3 text-muted-foreground text-xs">
                      <span className="inline-flex items-center gap-1" title="Practiced count">
                        <Eye className="h-3.5 w-3.5" /> {row.practicedCount ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1 hover:text-primary cursor-pointer transition-colors" title="Bookmark">
                        <Bookmark className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Loading skeleton component
export function QuestionsTableSkeleton() {
  return (
    <div className="rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[60%]">Title</TableHead>
            <TableHead className="w-32 text-center">Difficulty</TableHead>
            <TableHead className="w-32 text-center">Status</TableHead>
            <TableHead className="w-32 text-right">Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </TableCell>
              <TableCell>
                <div className="mx-auto h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              </TableCell>
              <TableCell>
                <div className="mx-auto h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              </TableCell>
              <TableCell>
                <div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
