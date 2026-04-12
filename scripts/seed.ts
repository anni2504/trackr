// scripts/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const senior = await prisma.user.upsert({
    where: { email: 'senior@test.com' },
    update: {},
    create: {
      name: 'Senior Supervisor',
      email: 'senior@test.com',
      password: hashedPassword,
      role: Role.SENIOR,
      verified: true,
    },
  });

  const junior = await prisma.user.upsert({
    where: { email: 'junior@test.com' },
    update: {},
    create: {
      name: 'Junior Supervisor',
      email: 'junior@test.com',
      password: hashedPassword,
      role: Role.JUNIOR,
      verified: true,
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: Role.STUDENT,
      verified: true,
      supervisorId: junior.id,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@test.com' },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: 'student2@test.com',
      password: hashedPassword,
      role: Role.STUDENT,
      verified: true,
      supervisorId: junior.id,
    },
  });

  // Seed some work logs
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.workLog.createMany({
    data: [
      { userId: student1.id, hours: 4.5, description: 'Implemented authentication module and OTP verification system', date: today },
      { userId: student1.id, hours: 3.0, description: 'Fixed bugs in the dashboard UI and improved responsiveness', date: yesterday },
      { userId: student2.id, hours: 5.0, description: 'Designed database schema and wrote Prisma migrations', date: today },
      { userId: student2.id, hours: 2.5, description: 'Code review and documentation updates', date: yesterday },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete!');
  console.log('📧 Test accounts:');
  console.log('   student@test.com  / password123 (STUDENT)');
  console.log('   student2@test.com / password123 (STUDENT)');
  console.log('   junior@test.com   / password123 (JUNIOR)');
  console.log('   senior@test.com   / password123 (SENIOR)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
