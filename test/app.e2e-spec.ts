import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PROFILE_SEED } from '../src/seed/seed-data';
import { seedProfile } from '../src/seed/seed';

/**
 * Интеграционный тест на реальной PostgreSQL (DATABASE_URL, например из docker-compose).
 * Проверяет ответ API и то, что вложенный запрос не порождает N+1.
 */
describe('GraphQL API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sqlQueries = 0;

  beforeAll(async () => {
    process.env.PRISMA_LOG_QUERIES = 'true';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
    prisma = app.get(PrismaService);
    prisma.$on('query', () => {
      sqlQueries += 1;
    });
    await seedProfile(prisma, PROFILE_SEED);
  });

  afterAll(async () => {
    await app?.close();
  });

  const gql = (query: string, variables?: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post('/graphql')
      .set('apollo-require-preflight', 'true')
      .send({ query, variables });

  it('отдаёт профиль со всеми вложенными данными за фиксированное число SQL-запросов', async () => {
    sqlQueries = 0;
    const res = await gql(`{
      profile {
        name
        links { label url }
        skills { name category }
        backend: skills(category: BACKEND) { name }
        experience { company period achievements { text } }
        projects { name repoUrl }
      }
    }`);

    expect(res.body.errors).toBeUndefined();
    const profile = res.body.data.profile;
    expect(profile.name).toBe(PROFILE_SEED.name);
    expect(profile.experience.map((e: { company: string }) => e.company)).toEqual([
      'CRYXXEN',
      'Qrepublik',
      'OGGO',
    ]);
    expect(profile.experience.every((e: { achievements: unknown[] }) => e.achievements.length > 0)).toBe(true);
    expect(profile.backend.length).toBeGreaterThan(0);
    // Profile + Link + Skill (общий для двух полей) + Experience + Achievement + Project
    expect(sqlQueries).toBe(6);
  });

  it('возвращает null для несуществующего профиля', async () => {
    const res = await gql('query ($slug: String) { profile(slug: $slug) { name } }', {
      slug: 'nobody',
    });
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.profile).toBeNull();
  });

  it('повторный сид не создаёт дублей', async () => {
    await seedProfile(prisma, PROFILE_SEED);
    expect(await prisma.profile.count({ where: { slug: PROFILE_SEED.slug } })).toBe(1);
    expect(await prisma.experience.count()).toBe(PROFILE_SEED.experience.length);
  });

  it('health-check отвечает ok', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
  });
});
