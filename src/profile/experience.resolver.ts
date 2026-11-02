import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../graphql/graphql-context';
import { AchievementModel, ExperienceModel } from './models/profile.models';
import type { ProfileLoaders } from './profile-loaders.factory';

@Resolver(() => ExperienceModel)
export class ExperienceResolver {
  /** N мест работы → один запрос `WHERE "experienceId" IN (...)`, а не N запросов. */
  @ResolveField(() => [AchievementModel])
  achievements(@Parent() experience: ExperienceModel, @Loaders() loaders: ProfileLoaders) {
    return loaders.achievements.load(experience.id);
  }
}
