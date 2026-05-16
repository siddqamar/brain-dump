import { AppLayout } from '@/components/layout';
import { MemoryDetailContent } from './memory-detail-content';

interface MemoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemoryDetailPage({ params }: MemoryDetailPageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <MemoryDetailContent memoryId={id} />
    </AppLayout>
  );
}
