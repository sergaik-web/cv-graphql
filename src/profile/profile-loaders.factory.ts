import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { toExperienceModel } from './experience.mapper';
import {
  AchievementModel,
  ExperienceModel,
  LinkModel,
  ProjectModel,
  SkillModel,
} from './models/profile.models';
import { ProfileRepository } from './profile.repository';

export interface ProfileLoaders {
  links: DataLoader<number, LinkModel[]>;
  skills: DataLoader<number, SkillModel[]>;
  experience: DataLoader<number, ExperienceModel[]>;
  projects: DataLoader<number, ProjectModel[]>;
  achievements: DataLoader<number, AchievementModel[]>;
}

/**
 * Раскладывает плоский результат запроса `WHERE parentId IN (...)` по ключам
 * в том же порядке, что и ключи батча (контракт DataLoader). Порядок строк
 * внутри группы сохраняется — его задаёт ORDER BY в репозитории.
 */
export function groupByKeys<T, K>(keys: readonly K[], rows: T[], keyOf: (row: T) => K): T[][] {
  const groups = new Map<K, T[]>(keys.map((key) => [key, []]));
  for (const row of rows) {
    groups.get(keyOf(row))?.push(row);
  }
  return keys.map((key) => groups.get(key) ?? []);
}

/**
 * Создаёт набор DataLoader'ов на каждый GraphQL-запрос. Отдельный экземпляр
 * на запрос важен: кэш DataLoader не должен жить между пользователями.
 */
@Injectable()
export class ProfileLoadersFactory {
  constructor(private readonly repository: ProfileRepository) {}

  create(): ProfileLoaders {
    return {
      links: new DataLoader(async (ids) =>
        groupByKeys(ids, await this.repository.findLinksByProfileIds(ids), (r) => r.profileId),
      ),
      skills: new DataLoader(async (ids) =>
        groupByKeys(ids, await this.repository.findSkillsByProfileIds(ids), (r) => r.profileId),
      ),
      experience: new DataLoader(async (ids) => {
        const now = new Date();
        const rows = await this.repository.findExperienceByProfileIds(ids);
        return groupByKeys(ids, rows, (r) => r.profileId).map((group) =>
          group.map((row) => toExperienceModel(row, now)),
        );
      }),
      projects: new DataLoader(async (ids) =>
        groupByKeys(ids, await this.repository.findProjectsByProfileIds(ids), (r) => r.profileId),
      ),
      achievements: new DataLoader(async (ids) =>
        groupByKeys(
          ids,
          await this.repository.findAchievementsByExperienceIds(ids),
          (r) => r.experienceId,
        ),
      ),
    };
  }
}
