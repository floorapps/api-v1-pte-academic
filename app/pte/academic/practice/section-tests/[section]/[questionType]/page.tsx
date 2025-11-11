import { notFound } from "next/navigation";
import { initialCategories } from "@/lib/pte/data";
import { PracticeSession } from "@/components/pte/practice/practice-session";
import { AcademicPracticeHeader } from "@/components/pte/practice-header";

export default function QuestionTypePage({
  params,
}: {
  params: Promise<{ section: string; questionType: string }>;
}) {
  const { section, questionType } = params;
  
  const category = initialCategories.find(
    (cat) => cat.code === questionType
  );

  if (!category) {
    notFound();
  }

  const parentCategory = initialCategories.find(
    (cat) => cat.id === category.parent
  );

  if (!parentCategory || parentCategory.code !== section) {
    notFound();
  }

  type SessionResult = {
    questionId: string;
    userAnswer: any;
    score?: number;
    feedback?: string;
    timeSpent: number;
    completedAt: Date;
  };

  const handleSessionComplete = (results: SessionResult[]) => {
    // TODO: Save results to database
    console.log('Session completed with results:', results);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AcademicPracticeHeader section={section} showFilters={false} />
        
        <div className="mt-6">
          <PracticeSession
            questionType={questionType}
            questionCount={5} // Configurable
            timeLimit={30} // 30 minutes
            onSessionComplete={handleSessionComplete}
          />
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const childCategories = initialCategories.filter((cat) => cat.parent !== null);
  
  return childCategories.map((category) => {
    const parentCategory = initialCategories.find((cat) => cat.id === category.parent);
    return {
      section: parentCategory?.code || '',
      questionType: category.code,
    };
  });
}