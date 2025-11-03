import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const uni = url.searchParams.get('universityId');
    const where = uni ? { where: { universityId: Number(uni) } } : {};
    const courses = await prisma.course.findMany({ ...(where as any), include: { university: true, instructors: { include: { instructor: true } } } });
    return NextResponse.json(courses);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req as any as NextRequest);
    const body = await req.json();
    const { title, description, credits = 3, universityId } = body;
    if (!title || !universityId) return NextResponse.json({ message: 'Missing' }, { status: 400 });

    if (payload.role === 'ADMIN') {
      const course = await prisma.course.create({ data: { title, description, credits: Number(credits), universityId: Number(universityId) } });
      return NextResponse.json(course, { status: 201 });
    }

    if (payload.role === 'INSTRUCTOR') {
      const inst = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!inst || inst.universityId !== Number(universityId)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      const course = await prisma.course.create({ data: { title, description, credits: Number(credits), universityId: Number(universityId) } });
      await prisma.instructorCourse.create({ data: { instructorId: payload.id, courseId: course.id } });
      return NextResponse.json(course, { status: 201 });
    }

    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
