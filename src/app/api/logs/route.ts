export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = new URL(req.url).searchParams.get('userId');
  const inc = { user: { select: { id: true, name: true, email: true } } };

  try {
    if (auth.role === 'STUDENT') {
      return NextResponse.json(await prisma.workLog.findMany({ where: { userId: auth.userId }, orderBy: { date: 'desc' }, include: inc }));
    }
    if (auth.role === 'JUNIOR') {
      const ids = (await prisma.user.findMany({ where: { supervisorId: auth.userId }, select: { id: true } })).map((s) => s.id);
      const filter = userId && ids.includes(userId) ? userId : undefined;
      return NextResponse.json(await prisma.workLog.findMany({ where: { userId: filter ?? { in: ids } }, orderBy: { date: 'desc' }, include: inc }));
    }
    return NextResponse.json(await prisma.workLog.findMany({ where: userId ? { userId } : {}, orderBy: { date: 'desc' }, include: inc }));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { hours, description, date } = await req.json();
    if (!hours || !description) return NextResponse.json({ error: 'Hours and description required' }, { status: 400 });
    const log = await prisma.workLog.create({ data: { userId: auth.userId, hours: parseFloat(hours), description, date: date ? new Date(date) : new Date() }, include: { user: { select: { id: true, name: true, email: true } } } });
    return NextResponse.json(log, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
