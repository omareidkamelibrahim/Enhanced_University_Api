import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const { studentId, courseId } = await req.json();
    if (!studentId || !courseId) return NextResponse.json({ message: 'Missing' }, { status: 400 });

    if (payload.role !== 'ADMIN' && payload.id !== Number(studentId)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    await prisma.enrollment.create({ data: { studentId: Number(studentId), courseId: Number(courseId) } });
    return NextResponse.json({ message: 'Enrolled' }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');
    const courseId = url.searchParams.get('courseId');
    if (!studentId || !courseId) return NextResponse.json({ message: 'Missing' }, { status: 400 });

    if (payload.role !== 'ADMIN' && payload.id !== Number(studentId)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    await prisma.enrollment.delete({ where: { studentId_courseId: { studentId: Number(studentId), courseId: Number(courseId) } } });
    return NextResponse.json({ message: 'Unenrolled' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
