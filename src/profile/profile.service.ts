import { Injectable } from '@nestjs/common';
import { SkillCategory } from '@prisma/client';
import { ProfileModel, SkillModel } from './models/profile.models';
import { ProfileRepository } from './profile.repository';

/** Бизнес-правила визитки; не знает ни про GraphQL, ни про SQL. */
@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  /** Профиль по slug; без slug — основной (первый созданный) профиль. */
  async getProfile(slug?: string): Promise<ProfileModel | null> {
    const profile = await this.repository.findProfile(slug);
    if (!profile) {
      return null;
    }
    return {
      id: profile.id,
      slug: profile.slug,
      name: profile.name,
      title: profile.title,
      description: profile.description,
      location: profile.location,
    };
  }

  /**
   * Фильтрация по категории — в памяти поверх общего батча: так запросы
   * `skills` и `skills(category: ...)` в одном документе делят один SQL-запрос.
   */
  filterSkills(skills: SkillModel[], category?: SkillCategory): SkillModel[] {
    return category ? skills.filter((skill) => skill.category === category) : skills;
  }
}
