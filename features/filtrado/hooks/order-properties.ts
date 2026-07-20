'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export function orderValueSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentOrder = searchParams.get('ordenar') || '';

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('ordenar', val);
    else params.delete('ordenar');
    router.push(`/propiedades?${params.toString()}`);
  };

  return {currentOrder, handleChange};
}
