import { Suspense } from 'react';
import { AppLayout } from '@/components/layout';
import { SearchContent } from './search-content';

export default function SearchPage() {
  return (
    <AppLayout>
      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
    </AppLayout>
  );
}

function SearchLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
