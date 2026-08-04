import { NextResponse } from 'next/server';
import { getLocalidadesPorPadre } from '@/backend/services/zone.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const padreId = searchParams.get('padreId');

  if (!padreId) return NextResponse.json([]);

  const localidades = await getLocalidadesPorPadre(parseInt(padreId, 10));
  return NextResponse.json(localidades);
}