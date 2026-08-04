import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/utils-auth';

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true, redirectTo: '/admin/login' });
}