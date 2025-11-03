import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) return NextResponse.json({ message: 'Missing' }, { status: 400 });

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (e) {
      return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
    }

    // verify token matches what we have in DB
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.refreshToken !== refreshToken) return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ accessToken });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
