export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendOTPEmail } from '@/lib/mailer';
import { generateOTP } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    await prisma.otpVerification.deleteMany({ where: { email } });
    await prisma.otpVerification.deleteMany({ where: { email: `pending:${email}` } });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.otpVerification.create({ data: { email, otp, expiresAt } });
    await prisma.otpVerification.create({ data: { email: `pending:${email}`, otp: JSON.stringify({ name, hashedPassword }), expiresAt } });

    await sendOTPEmail(email, otp, name);
    return NextResponse.json({ message: 'OTP sent' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
