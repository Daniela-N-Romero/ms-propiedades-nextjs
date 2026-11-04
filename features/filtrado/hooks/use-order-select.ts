'use client';
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export function useOrderSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentOrder = searchParams.get('ordenar') || searchParams.get('orden') || '';

  const setOrder = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('ordenar', value);
    } else {
      params.delete('ordenar');
      params.delete('orden');
    }
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return {
    currentOrder,
    setOrder,
    isPending,
  };
}