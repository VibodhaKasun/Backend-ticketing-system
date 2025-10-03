import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@local' },
    update: {},
    create: {
      email: 'admin@local',
      password: hashed,
      name: 'Administrator',
      role: 'ADMIN'
    }
  });

  await prisma.customer.upsert({
    where: { email: 'jane.customer@example.com' },
    update: {},
    create: {
      name: 'Jane Customer',
      email: 'jane.customer@example.com',
      phone: '+94123456789',
      company: 'Acme Inc'
    }
  });

  console.log('Seed finished');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());