import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { SkillCategory } from '@prisma/client';
import { Loaders } from '../graphql/graphql-context';
import {
  ExperienceModel,
  LinkModel,
  ProfileModel,
  ProjectModel,
  SkillModel,
} from './models/profile.models';
import type { ProfileLoaders } from './profile-loaders.factory';
import { ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileModel, {
    nullable: true,
    description: 'Профиль специалиста. Без аргумента — основной профиль визитки.',
  })
  profile(@Args('slug', { nullable: true }) slug?: string): Promise<ProfileModel | null> {
    return this.profileService.getProfile(slug);
  }

  // Вложенные поля резолвятся только если их запросили, и через DataLoader:
  // сколько бы профилей ни было в ответе, на каждое поле уходит один SQL-запрос.

  @ResolveField(() => [LinkModel])
  links(@Parent() profile: ProfileModel, @Loaders() loaders: ProfileLoaders) {
    return loaders.links.load(profile.id);
  }

  @ResolveField(() => [SkillModel])
  async skills(
    @Parent() profile: ProfileModel,
    @Loaders() loaders: ProfileLoaders,
    @Args('category', { type: () => SkillCategory, nullable: true }) category?: SkillCategory,
  ) {
    return this.profileService.filterSkills(await loaders.skills.load(profile.id), category);
  }

  @ResolveField(() => [ExperienceModel], { description: 'Опыт работы, от новых к старым' })
  experience(@Parent() profile: ProfileModel, @Loaders() loaders: ProfileLoaders) {
    return loaders.experience.load(profile.id);
  }

  @ResolveField(() => [ProjectModel])
  projects(@Parent() profile: ProfileModel, @Loaders() loaders: ProfileLoaders) {
    return loaders.projects.load(profile.id);
  }
}
