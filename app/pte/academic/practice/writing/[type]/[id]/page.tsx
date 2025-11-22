import { redirect } from 'next/navigation'

export default async function WritingPracticeDetailPage({
    params,
}: {
    params: { type: string; id: string }
}) {
    const { type, id } = params
    redirect(`/pte/academic/practice/writing/${type}/question/${id}`)
}
