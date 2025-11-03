import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding...');
  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existing) {
    console.log('Admin already exists, skipping seed.');
    return;
  }

  const uni = await prisma.university.create({ data: { name: 'Sample University', location: 'Cairo' } });

  const hashed = await bcrypt.hash('AdminPass123!', 10);
  const admin = await prisma.user.create({ data: { userName: 'admin', email: 'admin@example.com', password: hashed, role: 'ADMIN', universityId: uni.id } });

  const instructorHashed = await bcrypt.hash('InstructorPass123!', 10);
  const instructor = await prisma.user.create({ data: { userName: 'instructor1', email: 'instructor@example.com', password: instructorHashed, role: 'INSTRUCTOR', universityId: uni.id } });

  const studentHashed = await bcrypt.hash('StudentPass123!', 10);
  const student = await prisma.user.create({ data: { userName: 'student1', email: 'student@example.com', password: studentHashed, role: 'STUDENT', universityId: uni.id } });

  const course1 = await prisma.course.create({ data: { title: 'Intro to Programming', description: 'Learn basics', credits: 3, universityId: uni.id } });
  const course2 = await prisma.course.create({ data: { title: 'Database Systems', description: 'SQL & design', credits: 3, universityId: uni.id } });

  await prisma.instructorCourse.create({ data: { instructorId: instructor.id, courseId: course1.id } });

  await prisma.enrollment.create({ data: { studentId: student.id, courseId: course1.id } });

  console.log('Seeding finished. Admin credentials: admin@example.com / AdminPass123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
