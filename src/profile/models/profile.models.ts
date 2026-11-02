import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SkillCategory } from '@prisma/client';

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
  description: 'Группа навыка',
});

@ObjectType({ description: 'Ссылка на профессиональный ресурс' })
export class LinkModel {
  @Field(() => ID)
  id: number;

  @Field()
  label: string;

  @Field()
  url: string;
}

@ObjectType({ description: 'Навык' })
export class SkillModel {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;
}

@ObjectType({ description: 'Достижение в рамках места работы' })
export class AchievementModel {
  @Field(() => ID)
  id: number;

  @Field()
  text: string;
}

@ObjectType({ description: 'Место работы' })
export class ExperienceModel {
  @Field(() => ID)
  id: number;

  @Field()
  company: string;

  @Field()
  position: string;

  @Field({ description: 'Дата начала, ISO 8601 (YYYY-MM-DD)' })
  startDate: string;

  @Field(() => String, { nullable: true, description: 'Дата окончания; null — работаю сейчас' })
  endDate: string | null;

  @Field({ description: 'Период для отображения, например «12.2023 — 06.2025»' })
  period: string;

  @Field(() => Int, { description: 'Длительность в полных месяцах' })
  durationMonths: number;

  @Field()
  isCurrent: boolean;

  @Field(() => String, { nullable: true })
  summary: string | null;
}

@ObjectType({ description: 'Проект' })
export class ProjectModel {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => String, { nullable: true, description: 'Ссылка на работающий проект' })
  url: string | null;

  @Field(() => String, { nullable: true, description: 'Ссылка на репозиторий' })
  repoUrl: string | null;

  @Field(() => [String])
  stack: string[];
}

@ObjectType({ description: 'Профиль специалиста' })
export class ProfileModel {
  @Field(() => ID)
  id: number;

  @Field()
  slug: string;

  @Field()
  name: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => String, { nullable: true })
  location: string | null;
}
