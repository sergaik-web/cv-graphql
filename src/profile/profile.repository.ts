import { Injectable } from '@nestjs/common';
import { Achievement, Experience, Link, Profile, Project, Skill } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Единственное место, которое знает про Prisma и SQL-порядок.
 * Методы «по списку id» нужны DataLoader'ам: один запрос на весь батч.
 */
@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProfile(slug?: string): Promise<Profile | null> {
    return slug
      ? this.prisma.profile.findUnique({ where: { slug } })
      : this.prisma.profile.findFirst({ orderBy: { id: 'asc' } });
  }

  findLinksByProfileIds(profileIds: readonly number[]): Promise<Link[]> {
    return this.prisma.link.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });
  }

  findSkillsByProfileIds(profileIds: readonly number[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ category: 'asc' }, { position: 'asc' }, { id: 'asc' }],
    });
  }

  findExperienceByProfileIds(profileIds: readonly number[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
    });
  }

  findProjectsByProfileIds(profileIds: readonly number[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });
  }

  findAchievementsByExperienceIds(experienceIds: readonly number[]): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });
  }
}
