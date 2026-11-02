import { Experience } from '@prisma/client';
import { ExperienceModel } from './models/profile.models';

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const monthYear = (date: Date) =>
  `${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`;

/** Полные месяцы между датами, включая месяц начала: 12.2023—06.2025 → 19. */
export function monthsBetween(start: Date, end: Date): number {
  return (
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth()) +
    1
  );
}

export function toExperienceModel(entity: Experience, now: Date = new Date()): ExperienceModel {
  const end = entity.endDate ?? now;
  return {
    id: entity.id,
    company: entity.company,
    position: entity.position,
    startDate: isoDate(entity.startDate),
    endDate: entity.endDate ? isoDate(entity.endDate) : null,
    period: `${monthYear(entity.startDate)} — ${entity.endDate ? monthYear(entity.endDate) : 'н. в.'}`,
    durationMonths: Math.max(monthsBetween(entity.startDate, end), 0),
    isCurrent: entity.endDate === null,
    summary: entity.summary,
  };
}
