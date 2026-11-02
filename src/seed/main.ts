import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PROFILE_SEED } from './seed-data';
import { seedProfile } from './seed';

/** Точка входа сидирования: `node dist/seed/main.js` (в Docker) или `prisma db seed`. */
async function main() {
  const logger = new Logger('Seed');
  const prisma = new PrismaClient();
  try {
    const id = await seedProfile(prisma, PROFILE_SEED);
    logger.log(`Профиль «${PROFILE_SEED.slug}» заполнен (id=${id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
