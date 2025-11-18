import { initialCategories } from "@/lib/pte/data";
import SpeakingPracticePage from "../page";

// Next 16: pre-render dynamic segment with generateStaticParams
export async function generateStaticParams() {
  return initialCategories
    .filter((c) => c.parent === 1) // Speaking children
    .map((c) => ({ questionType: c.code }));
}

export default async function SpeakingQuestionTypePage(props: {
  params: Promise<{ questionType: string }>;
}) {
  const params = await props.params;
  const { questionType } = await params;
  // Reuse the parent section page and set the active tab via params
  return (
    <SpeakingPracticePage
      params={Promise.resolve({ category: questionType })}
    />
  );
}
