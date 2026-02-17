'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ICPForm } from '@/components/icp/ICPForm';
import { Skeleton } from '@/components/ui/skeleton';
import type { ICP } from '@/lib/types';

function NewICPContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [icp, setIcp] = useState<ICP | undefined>();
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      fetch(`/api/icp/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          setIcp(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [editId]);

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return <ICPForm icp={icp} />;
}

export default function NewICPPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <NewICPContent />
    </Suspense>
  );
}
