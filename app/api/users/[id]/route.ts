import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(req: Request) {
  try {
    const { id } = (req as any).params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) }, include: { university: true } });
    if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const { id } = (req as any).params;
    if (payload.role !== 'ADMIN' && payload.id !== Number(id)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    if (body.role && payload.role !== 'ADMIN') delete body.role;

    const updated = await prisma.user.update({ where: { id: Number(id) }, data: body });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const { id } = (req as any).params;
    if (payload.role !== 'ADMIN' && payload.id !== Number(id)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
