import { AcademicPracticeHeader } from "@/components/pte/practice-header";
import { QuestionsTableSkeleton } from "@/components/pte/questions-table";

export default function Loading() {
    return (
        <>
            <AcademicPracticeHeader section="reading" showFilters={true} />
            <div className="mt-6">
                <QuestionsTableSkeleton />
            </div>
        </>
    );
}
