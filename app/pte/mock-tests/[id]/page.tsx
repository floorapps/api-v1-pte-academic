import { notFound } from 'next/navigation';
import { generateMockTestData, MockTest } from '@/lib/pte/mock-test-data';
import MockTestSimulator from '@/components/pte/mock-test-simulator';

interface MockTestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MockTestPage({ params }: MockTestPageProps) {
  return <MockTestContent params={params} />;
}

async function MockTestContent({ params }: MockTestPageProps) {
  const { id } = await params;
  
  // Find the mock test by ID
  const mockTests = generateMockTestData();
  const mockTest = mockTests.find(test => test.id === id);
  
  if (!mockTest) {
    notFound();
  }

  return <MockTestSimulator mockTest={mockTest} />;
}