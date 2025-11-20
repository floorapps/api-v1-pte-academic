import { notFound } from 'next/navigation'
import MockTestSimulator from '@/components/pte/mock-test-simulator'
import { generateMockTestData, MockTest } from '@/lib/pte/mock-test-data'

interface MockTestPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MockTestPage({ params }: { params: { id: string } }) {
  return <MockTestContent params={params} />
}

function MockTestContent({ params }: { params: { id: string } }) {
  const { id } = params

  // Find the mock test by ID
  const mockTests = generateMockTestData()
  const mockTest = mockTests.find((test) => test.id === id)

  if (!mockTest) {
    notFound()
  }

  return <MockTestSimulator mockTest={mockTest} />
}
