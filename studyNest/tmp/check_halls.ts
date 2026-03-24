
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- ALL HALLS IN DB ---');
  const allHalls = await prisma.lecture_halls.findMany();
  console.log(JSON.stringify(allHalls, null, 2));

  console.log('\n--- STUDENT API FILTERED ---');
  const filteredHalls = await prisma.lecture_halls.findMany({
    where: {
      is_active: true,
      maintenance_status: 'available',
    },
  });
  console.log(JSON.stringify(filteredHalls, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
