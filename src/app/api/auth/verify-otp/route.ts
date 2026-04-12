export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });

    const otpRecord = await prisma.otpVerification.findFirst({ where: { email, otp }, orderBy: { createdAt: 'desc' } });
    if (!otpRecord) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    if (otpRecord.expiresAt < new Date()) return NextResponse.json({ error: 'OTP expired' }, { status: 400 });

    const pending = await prisma.otpVerification.findFirst({ where: { email: `pending:${email}` }, orderBy: { createdAt: 'desc' } });
    if (!pending) return NextResponse.json({ error: 'Session expired, sign up again' }, { status: 400 });

    const { name, hashedPassword } = JSON.parse(pending.otp);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, role: 'STUDENT', verified: true } });

    await prisma.otpVerification.deleteMany({ where: { email } });
    await prisma.otpVerification.deleteMany({ where: { email: `pending:${email}` } });

    const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
