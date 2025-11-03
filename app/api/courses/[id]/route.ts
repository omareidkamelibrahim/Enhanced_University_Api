import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(req: Request) {
  try {
    const { id } = (req as any).params;
    const course = await prisma.course.findUnique({ where: { id: Number(id) }, include: { university: true, instructors: { include: { instructor: true } }, enrollments: { include: { student: true } } } });
    if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(course);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const { id } = (req as any).params;
    const body = await req.json();

    const course = await prisma.course.findUnique({ where: { id: Number(id) } });
    if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    if (payload.role === 'ADMIN') {
      const updated = await prisma.course.update({ where: { id: Number(id) }, data: body });
      return NextResponse.json(updated);
    }

    if (payload.role === 'INSTRUCTOR') {
      const assigned = await prisma.instructorCourse.findUnique({ where: { instructorId_courseId: { instructorId: payload.id, courseId: Number(id) } } });
      if (!assigned) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      const updated = await prisma.course.update({ where: { id: Number(id) }, data: body });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const { id } = (req as any).params;
    const course = await prisma.course.findUnique({ where: { id: Number(id) } });
    if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    if (payload.role === 'ADMIN') {
      await prisma.course.delete({ where: { id: Number(id) } });
      return NextResponse.json({ message: 'Deleted' });
    }

    if (payload.role === 'INSTRUCTOR') {
      const assigned = await prisma.instructorCourse.findUnique({ where: { instructorId_courseId: { instructorId: payload.id, courseId: Number(id) } } });
      if (!assigned) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      await prisma.course.delete({ where: { id: Number(id) } });
      return NextResponse.json({ message: 'Deleted' });
    }

    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
