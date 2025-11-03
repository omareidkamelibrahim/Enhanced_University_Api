import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const { instructorId, courseId } = await req.json();
    if (payload.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    await prisma.instructorCourse.create({ data: { instructorId: Number(instructorId), courseId: Number(courseId) } });
    return NextResponse.json({ message: 'Assigned' }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const url = new URL(req.url);
    const instructorId = url.searchParams.get('instructorId');
    const courseId = url.searchParams.get('courseId');
    if (payload.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    if (!instructorId || !courseId) return NextResponse.json({ message: 'Missing' }, { status: 400 });

    await prisma.instructorCourse.delete({ where: { instructorId_courseId: { instructorId: Number(instructorId), courseId: Number(courseId) } } });
    return NextResponse.json({ message: 'Unassigned' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
