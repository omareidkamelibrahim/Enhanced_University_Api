import { NextResponse } from 'next/server';
import { clearRefreshTokenForUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ message: 'Missing' }, { status: 400 });

    await clearRefreshTokenForUser(Number(userId));
    return NextResponse.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
