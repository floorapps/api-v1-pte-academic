import { redirect } from 'next/navigation'

export default async function ListeningPracticeDetailPage({
  params,
}: {
  params: { type: string; id: string }
}) {
  const { type, id } = params
  redirect(`/pte/academic/practice/listening/${type}/question/${id}`)
}
