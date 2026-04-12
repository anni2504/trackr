export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const active = await prisma.timerSession.findFirst({ where: { userId: auth.userId, endTime: null }, orderBy: { startTime: 'desc' } });
  return NextResponse.json(active || null);
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { action } = await req.json();
    if (action === 'start') {
      await prisma.timerSession.updateMany({ where: { userId: auth.userId, endTime: null }, data: { endTime: new Date() } });
      return NextResponse.json(await prisma.timerSession.create({ data: { userId: auth.userId, startTime: new Date() } }), { status: 201 });
    }
    if (action === 'stop') {
      const active = await prisma.timerSession.findFirst({ where: { userId: auth.userId, endTime: null }, orderBy: { startTime: 'desc' } });
      if (!active) return NextResponse.json({ error: 'No active timer' }, { status: 400 });
      const endTime = new Date();
      const session = await prisma.timerSession.update({ where: { id: active.id }, data: { endTime } });
      const hours = parseFloat(((endTime.getTime() - new Date(active.startTime).getTime()) / 3600000).toFixed(2));
      return NextResponse.json({ session, hours });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
