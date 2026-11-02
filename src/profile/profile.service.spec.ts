import { SkillCategory } from '@prisma/client';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  const repository = { findProfile: jest.fn() } as unknown as jest.Mocked<ProfileRepository>;
  const service = new ProfileService(repository);

  it('возвращает null, если профиля нет', async () => {
    repository.findProfile.mockResolvedValueOnce(null);
    await expect(service.getProfile('missing')).resolves.toBeNull();
  });

  it('фильтрует навыки по категории, без категории отдаёт все', () => {
    const skills = [
      { id: 1, name: 'React', category: SkillCategory.FRONTEND },
      { id: 2, name: 'NestJS', category: SkillCategory.BACKEND },
    ];
    expect(service.filterSkills(skills, SkillCategory.BACKEND).map((s) => s.name)).toEqual([
      'NestJS',
    ]);
    expect(service.filterSkills(skills)).toHaveLength(2);
  });
});
