export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@/lib/auth';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekStart = startOfDay(subDays(today, 6));

    let studentIds: string[] = [];
    if (auth.role === 'STUDENT') {
      studentIds = [auth.userId];
    } else if (auth.role === 'JUNIOR') {
      const s = await prisma.user.findMany({ where: { supervisorId: auth.userId }, select: { id: true } });
      studentIds = s.map((x) => x.id);
    } else {
      const s = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
      studentIds = s.map((x) => x.id);
    }

    const where = { userId: { in: studentIds } };
    const todayLogs = await prisma.workLog.findMany({ where: { ...where, date: { gte: todayStart, lte: todayEnd } } });
    const weekLogs = await prisma.workLog.findMany({ where: { ...where, date: { gte: weekStart, lte: todayEnd } } });

    const dailyHours = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const logs = weekLogs.filter((l) => new Date(l.date) >= startOfDay(day) && new Date(l.date) <= endOfDay(day));
      dailyHours.push({ date: format(day, 'MMM d'), hours: parseFloat(logs.reduce((s, l) => s + l.hours, 0).toFixed(1)), logs: logs.length });
    }

    let perStudentHours: any[] = [];
    if (auth.role !== 'STUDENT') {
      const students = await prisma.user.findMany({ where: { id: { in: studentIds } }, select: { id: true, name: true, email: true } });
      perStudentHours = await Promise.all(students.map(async (s) => {
        const all = await prisma.workLog.findMany({ where: { userId: s.id } });
        const todayH = all.filter((l) => new Date(l.date) >= todayStart && new Date(l.date) <= todayEnd);
        return { userId: s.id, name: s.name, email: s.email, totalHours: parseFloat(all.reduce((a, l) => a + l.hours, 0).toFixed(1)), logsCount: all.length, todayHours: parseFloat(todayH.reduce((a, l) => a + l.hours, 0).toFixed(1)) };
      }));
    }

    return NextResponse.json({ totalHoursToday: todayLogs.reduce((s, l) => s + l.hours, 0), totalLogsToday: todayLogs.length, totalHoursWeek: weekLogs.reduce((s, l) => s + l.hours, 0), dailyHours, perStudentHours });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
