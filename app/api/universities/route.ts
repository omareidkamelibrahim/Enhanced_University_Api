import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const universities = await prisma.university.findMany({
      include: { users: true, courses: true },
    });
    return NextResponse.json(universities);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
//create new university
export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req);
    if (payload.role !== 'ADMIN')
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const { name, location } = await req.json();
    const uni = await prisma.university.create({
      data: { name, location },
    });
    return NextResponse.json(uni);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
