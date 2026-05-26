'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EventRegistrationsPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/admin');
  }, [router]);
  return null;
}
