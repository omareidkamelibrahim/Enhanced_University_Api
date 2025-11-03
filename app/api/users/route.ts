import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const url = new URL(req.url);
    const uni = url.searchParams.get('universityId');

    if (payload.role === 'ADMIN') {
      const users = await prisma.user.findMany({ include: { university: true } });
      return NextResponse.json(users);
    }

    if (payload.role === 'INSTRUCTOR' && uni) {
      const users = await prisma.user.findMany({ where: { universityId: Number(uni) }, include: { university: true } });
      return NextResponse.json(users);
    }

    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    if (payload.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { userName, email, password, role = 'STUDENT', universityId } = await req.json();
    if (!userName || !email || !password || !universityId) return NextResponse.json({ message: 'Missing' }, { status: 400 });

    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { userName, email, password: hashed, role, universityId: Number(universityId) } });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
