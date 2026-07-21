'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function orderValueSettings() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentOrder = searchParams.get('ordenar') || '';

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('ordenar', val);
    else params.delete('ordenar');
    router.push(`${pathname}?${params.toString()}`);
  };

  return {currentOrder, handleChange};
}
