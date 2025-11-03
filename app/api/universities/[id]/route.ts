import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: any) {
  try {
    const uni = await prisma.university.findUnique({
      where: { id: Number(params.id) },
      include: { users: true, courses: true },
    });
    if (!uni) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(uni);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: any) {
  try {
    const payload = await requireAuth(req);
    if (payload.role !== 'ADMIN')
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const { name, location } = await req.json();
    const updated = await prisma.university.update({
      where: { id: Number(params.id) },
      data: { name, location },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const payload = await requireAuth(req);
    if (payload.role !== 'ADMIN')
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    await prisma.university.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
