import { Prisma, PrismaClient, SkillCategory } from '@prisma/client';
import { SeedProfile } from './seed-data';

const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

/**
 * Идемпотентное заполнение: профиль с данным slug пересоздаётся целиком
 * в одной транзакции (дочерние записи удаляются каскадом). Повторный запуск
 * при каждом старте контейнера даёт одно и то же состояние без дублей.
 */
export async function seedProfile(prisma: PrismaClient, data: SeedProfile): Promise<number> {
  const skills: Prisma.SkillCreateWithoutProfileInput[] = Object.entries(data.skills).flatMap(
    ([category, names]) =>
      (names ?? []).map((name, position) => ({
        name,
        category: category as SkillCategory,
        position,
      })),
  );

  return prisma.$transaction(async (tx) => {
    await tx.profile.deleteMany({ where: { slug: data.slug } });
    const profile = await tx.profile.create({
      data: {
        slug: data.slug,
        name: data.name,
        title: data.title,
        description: data.description,
        location: data.location,
        links: { create: data.links.map((link, position) => ({ ...link, position })) },
        skills: { create: skills },
        projects: {
          create: data.projects.map((project, position) => ({
            name: project.name,
            description: project.description,
            url: project.url ?? null,
            repoUrl: project.repoUrl ?? null,
            stack: project.stack,
            position,
          })),
        },
        experience: {
          create: data.experience.map((item) => ({
            company: item.company,
            position: item.position,
            startDate: toDate(item.startDate),
            endDate: item.endDate ? toDate(item.endDate) : null,
            summary: item.summary ?? null,
            achievements: {
              create: item.achievements.map((text, position) => ({ text, position })),
            },
          })),
        },
      },
    });
    return profile.id;
  });
}
