import { NextResponse } from 'next/server';
import { getSubtiposPorMercado } from '@/backend/services/tipo-inmueble.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const padreId = searchParams.get('padreId');

  if (!padreId) return NextResponse.json([]);

  const subtipos = await getSubtiposPorMercado(parseInt(padreId, 10), false);
  return NextResponse.json(subtipos);
}