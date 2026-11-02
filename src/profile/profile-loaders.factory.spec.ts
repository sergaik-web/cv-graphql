import { Achievement, Experience } from '@prisma/client';
import { groupByKeys, ProfileLoadersFactory } from './profile-loaders.factory';
import { ProfileRepository } from './profile.repository';

describe('groupByKeys', () => {
  it('раскладывает строки по ключам в порядке ключей и отдаёт пустой массив для ключей без строк', () => {
    const rows = [
      { parent: 2, v: 'a' },
      { parent: 1, v: 'b' },
      { parent: 2, v: 'c' },
    ];
    expect(groupByKeys([1, 2, 3], rows, (r) => r.parent)).toEqual([
      [{ parent: 1, v: 'b' }],
      [
        { parent: 2, v: 'a' },
        { parent: 2, v: 'c' },
      ],
      [],
    ]);
  });
});

describe('ProfileLoadersFactory', () => {
  const achievement = (id: number, experienceId: number): Achievement => ({
    id,
    experienceId,
    text: `achievement ${id}`,
    position: id,
  });

  function setup() {
    const repository = {
      findAchievementsByExperienceIds: jest.fn(async (ids: readonly number[]) =>
        [achievement(1, 10), achievement(2, 30), achievement(3, 10)].filter((a) =>
          ids.includes(a.experienceId),
        ),
      ),
      findExperienceByProfileIds: jest.fn(async (): Promise<Experience[]> => [
        {
          id: 10,
          profileId: 1,
          company: 'ACME',
          position: 'Dev',
          startDate: new Date('2023-12-01T00:00:00Z'),
          endDate: new Date('2025-06-30T00:00:00Z'),
          summary: null,
        },
      ]),
    } as unknown as jest.Mocked<ProfileRepository>;
    return { repository, factory: new ProfileLoadersFactory(repository) };
  }

  it('схлопывает загрузку достижений нескольких мест работы в один запрос (нет N+1)', async () => {
    const { repository, factory } = setup();
    const loaders = factory.create();

    const [first, second, third] = await Promise.all([
      loaders.achievements.load(10),
      loaders.achievements.load(20),
      loaders.achievements.load(30),
    ]);

    expect(repository.findAchievementsByExperienceIds).toHaveBeenCalledTimes(1);
    expect(repository.findAchievementsByExperienceIds).toHaveBeenCalledWith([10, 20, 30]);
    expect(first.map((a) => a.id)).toEqual([1, 3]);
    expect(second).toEqual([]);
    expect(third.map((a) => a.id)).toEqual([2]);
  });

  it('создаёт независимые загрузчики на каждый запрос — кэш не переживает запрос', async () => {
    const { repository, factory } = setup();

    await factory.create().achievements.load(10);
    await factory.create().achievements.load(10);

    expect(repository.findAchievementsByExperienceIds).toHaveBeenCalledTimes(2);
  });

  it('отдаёт опыт работы уже в форме GraphQL-модели', async () => {
    const { factory } = setup();

    const [experience] = await factory.create().experience.load(1);

    expect(experience).toMatchObject({
      id: 10,
      startDate: '2023-12-01',
      endDate: '2025-06-30',
      period: '12.2023 — 06.2025',
      durationMonths: 19,
      isCurrent: false,
    });
  });
});
