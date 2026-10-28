import { PrismaClient } from '@prisma/client';
import { PREGNANCY_WEEKS } from './seed-data/pregnancy-weeks';

/** يُستدعى من seed.ts، ويعمل وحده أيضًا: `npm run seed:pregnancy-weeks` — دون باقي الـseed الذي يحذف ويعيد إنشاء بيانات أخرى */
export async function seedPregnancyWeeks(prisma: PrismaClient) {
  for (const week of PREGNANCY_WEEKS) {
    await prisma.pregnancyWeekContent.upsert({
      where: { weekNumber: week.weekNumber },
      update: week,
      create: week,
    });
  }
  return PREGNANCY_WEEKS.length;
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedPregnancyWeeks(prisma)
    .then((n) => console.log(`تم زرع محتوى ${n} أسبوعًا في pregnancy_week_content`))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
