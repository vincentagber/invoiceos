import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@invoiceos.com';
  const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomUUID();
  const name = process.env.SEED_ADMIN_NAME || 'Admin User';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Seed: Admin user ${email} already exists, skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      businesses: {
        create: { name: `${name}'s Business` },
      },
    },
  });

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`\n⚠️  Admin user created with auto-generated password:`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Set SEED_ADMIN_PASSWORD and SEED_ADMIN_EMAIL env vars to customize.\n`);
  } else {
    console.log(`Admin user ${email} created successfully.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
