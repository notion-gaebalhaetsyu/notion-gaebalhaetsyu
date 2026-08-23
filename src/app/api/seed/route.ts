import { NextResponse } from 'next/server';
import { seedInitialData } from '@/utils/firebase/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await seedInitialData();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await seedInitialData();
  return NextResponse.json(result);
}
