import { getSectionQuestionTypes } from "@/lib/pte/queries";
import { PracticeFilters } from "@/components/pte/PracticeFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sectionTitle: Record<string, string> = {
  speaking: "Speaking",
  writing: "Writing",
  reading: "Reading",
  listening: "Listening",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const params = await searchParams;
  const category = (params?.category || "reading").toUpperCase();
  const type = (params?.type || "academic").toUpperCase();

  const items = await getSectionQuestionTypes({
    testType: type,
    section: category,
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <aside>
          <PracticeFilters />
        </aside>

        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Start Your PTE {type === "ACADEMIC" ? "Academic" : "Core"} Practice Test Online
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Prepare with targeted online PTE practice tests across all sections.
            </p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">{sectionTitle[category.toLowerCase()]}</h2>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-600 text-sm">No practice items yet. Please seed the database.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((it) => (
                <Card key={it.questionType}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{it.questionType}</p>
                      <p className="text-xs text-gray-500">{it.count} questions available</p>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/tests/start?type=${type.toLowerCase()}&section=${category.toLowerCase()}&q=${encodeURIComponent(it.questionType)}`}>
                        Practice
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
