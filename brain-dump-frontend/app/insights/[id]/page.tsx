import { notFound } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { InsightDetailContent } from './insight-detail-content';
import { mockInsights } from '@/lib/mock-data';

interface InsightDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InsightDetailPage({ params }: InsightDetailPageProps) {
  const { id } = await params;
  const insight = mockInsights.find((i) => i.id === id);

  if (!insight) {
    notFound();
  }

  return (
    <AppLayout>
      <InsightDetailContent insightId={id} />
    </AppLayout>
  );
}
