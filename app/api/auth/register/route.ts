import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken, saveRefreshTokenForUser } from '@/lib/auth';

type ReqBody = { userName: string; email: string; password: string; universityId: number; role?: string };

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json();
    const { userName, email, password, universityId, role = 'STUDENT' } = body;
    if (!userName || !email || !password || !universityId) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ message: 'Email already in use' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { userName, email, password: hashed, role, universityId: Number(universityId) },
    });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // persist refresh token
    await saveRefreshTokenForUser(user.id, refreshToken);

    return NextResponse.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, userName: user.userName } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
