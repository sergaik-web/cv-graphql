import { Experience } from '@prisma/client';
import { monthsBetween, toExperienceModel } from './experience.mapper';

const date = (iso: string) => new Date(`${iso}T00:00:00Z`);

const entity = (overrides: Partial<Experience> = {}): Experience => ({
  id: 1,
  profileId: 1,
  company: 'OGGO',
  position: 'Fullstack',
  startDate: date('2019-11-01'),
  endDate: date('2023-12-31'),
  summary: null,
  ...overrides,
});

describe('monthsBetween', () => {
  it('считает месяц начала и месяц окончания включительно', () => {
    expect(monthsBetween(date('2019-11-01'), date('2023-12-31'))).toBe(50);
    expect(monthsBetween(date('2024-03-01'), date('2024-03-31'))).toBe(1);
  });
});

describe('toExperienceModel', () => {
  it('форматирует законченный период', () => {
    expect(toExperienceModel(entity())).toMatchObject({
      startDate: '2019-11-01',
      endDate: '2023-12-31',
      period: '11.2019 — 12.2023',
      durationMonths: 50,
      isCurrent: false,
    });
  });

  it('для текущего места работы считает длительность до «сейчас»', () => {
    const model = toExperienceModel(entity({ endDate: null }), date('2020-02-15'));
    expect(model).toMatchObject({
      endDate: null,
      period: '11.2019 — н. в.',
      durationMonths: 4,
      isCurrent: true,
    });
  });
});
