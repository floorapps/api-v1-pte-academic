import { redirect } from 'next/navigation'

export default async function ReadingPracticeDetailPage({
  params,
}: {
  params: { type: string; id: string }
}) {
  const { type, id } = params
  redirect(`/pte/academic/practice/reading/${type}/question/${id}`)
}
