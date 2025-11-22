import { redirect } from 'next/navigation'

export default async function SpeakingPracticeDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type, id } = await params
  redirect(`/pte/academic/practice/speaking/${type}/question/${id}`)
}
