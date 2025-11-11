import { initialCategories } from "@/lib/pte/data";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { AcademicPracticeHeader } from "@/components/pte/practice-header";

export default function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = params;
  
  const parentCategory = initialCategories.find(
    (cat) => cat.code === section && cat.parent === null
  );

  if (!parentCategory) {
    notFound();
  }

  const childCategories = initialCategories.filter(
    (cat) => cat.parent === parentCategory.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AcademicPracticeHeader section={section} />
        
        <div className="mt-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={parentCategory.icon}
                alt={parentCategory.title}
                width={48}
                height={48}
              />
              <div>
                <h1 className="text-2xl font-bold">{parentCategory.title}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Choose from {childCategories.length} question types
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {childCategories.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={child.icon}
                      alt={child.title}
                      width={32}
                      height={32}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{child.title}</h3>
                      <p className="text-sm text-gray-500">
                        {child.question_count} questions available
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 flex-grow">
                    {child.description}
                  </p>
                  
                  <div className="mt-auto">
                    <Button asChild className="w-full">
                      <Link
                        href={`/pte/academic/practice/section-tests/${section}/${child.code}`}
                      >
                        Start Practicing
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const parentCategories = initialCategories.filter((cat) => cat.parent === null);
  
  return parentCategories.map((category) => ({
    section: category.code,
  }));
}