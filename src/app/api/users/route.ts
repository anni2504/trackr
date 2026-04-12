export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (auth.role === 'JUNIOR') {
      return NextResponse.json(await prisma.user.findMany({ where: { supervisorId: auth.userId, role: 'STUDENT' }, select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { name: 'asc' } }));
    }
    if (auth.role === 'SENIOR') {
      return NextResponse.json(await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, email: true, role: true, createdAt: true, supervisor: { select: { id: true, name: true } } }, orderBy: { name: 'asc' } }));
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
