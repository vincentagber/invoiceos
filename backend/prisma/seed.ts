import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@invoiceos.com';
  const password = 'Password123!';
  const name = 'Admin User';

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User ${email} already exists.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      businesses: {
        create: {
          name: `${name}'s Business`,
        },
      },
    },
  });

  console.log('✅ Default user created successfully:');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('❌ Error creating user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
