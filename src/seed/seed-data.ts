import { SkillCategory } from '@prisma/client';

/**
 * Содержимое визитки. Хранится в коде, а не в SQL-дампе: так данные
 * типизированы схемой Prisma и меняются обычным коммитом.
 */
export interface SeedExperience {
  company: string;
  position: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  summary?: string;
  achievements: string[];
}

export interface SeedProject {
  name: string;
  description: string;
  url?: string;
  repoUrl?: string;
  stack: string[];
}

export interface SeedProfile {
  slug: string;
  name: string;
  title: string;
  description: string;
  location: string;
  links: { label: string; url: string }[];
  skills: Partial<Record<SkillCategory, string[]>>;
  experience: SeedExperience[];
  projects: SeedProject[];
}

export const PROFILE_SEED: SeedProfile = {
  slug: 'sergey-segrenev',
  name: 'Сергей Сегренёв',
  title: 'Fullstack-разработчик · TypeScript, React, Node.js / NestJS',
  description:
    'Fullstack-разработчик с коммерческим опытом более 5 лет. Последние полтора года — ' +
    'Senior-разработчик и техлид на аутсорс-проекте: архитектура, ревью, процессы, ' +
    'коммуникация с заказчиком. Основной стек — React / Next.js и Node.js / NestJS на ' +
    'TypeScript. Ежедневно работаю с AI-агентами (Claude Code) и проверяю результат сам.',
  location: 'Минск, Беларусь (UTC+3), удалённо',
  links: [
    { label: 'GitHub', url: 'https://github.com/sergaik-web' },
    { label: 'Резюме на hh.ru', url: 'https://hh.ru/resume/d23d02a2ff0eecddb50039ed1f394d33337444' },
  ],
  skills: {
    LANGUAGE: ['TypeScript', 'JavaScript'],
    FRONTEND: ['React', 'Redux', 'Next.js', 'Vue 3', 'Angular 17', 'React Native', 'Ant Design', 'Canvas', 'SSR'],
    BACKEND: ['Node.js', 'NestJS', 'Express', 'REST API', 'WebSocket'],
    DATABASE: ['PostgreSQL'],
    DEVOPS: ['Docker', 'CI/CD', 'Git'],
    AI: ['Claude Code', 'OpenAI API', 'Gemini API', 'DeepSeek API'],
    PRACTICE: ['Техлидство и выстраивание процессов', 'Code review', 'Менторство', 'Jira'],
  },
  experience: [
    {
      company: 'CRYXXEN',
      position: 'Senior-разработчик → техлид (аутсорс)',
      startDate: '2023-12-01',
      endDate: '2025-06-30',
      summary: 'Аутсорс-разработка для промышленного заказчика и внутренние AI-инструменты.',
      achievements: [
        'Разработал графический редактор схем производства для промышленной АРМ-системы (Angular 17 + Canvas): анимации состояний и оповещения.',
        'Разработал корпоративного AI-чат-бота с интеграцией OpenAI, Gemini и DeepSeek, клиент — Discord.',
        'Вырос с Senior до техлида: выстроил процессы разработки и code review в команде.',
        'Вёл коммуникацию с заказчиком, в том числе в конфликтных ситуациях.',
      ],
    },
    {
      company: 'OGGO',
      position: 'Fullstack-разработчик',
      startDate: '2019-11-01',
      endDate: '2023-12-31',
      summary: 'Агрегатор услуг, работающий в Оренбурге, Челябинске и Тбилиси.',
      achievements: [
        'Разрабатывал веб-платформу агрегатора: React, Redux, Next.js, Ant Design на фронтенде и NestJS на бэкенде.',
        'Реализовал работу с картами и геопозиционированием.',
        'Интегрировал платёжные системы и биллинг.',
        'Разработал 3 мобильных приложения на React Native.',
        'Менторил разработчиков команды.',
      ],
    },
    {
      company: 'Qrepublik',
      position: 'Frontend-разработчик',
      startDate: '2020-01-01',
      endDate: '2022-09-30',
      summary: 'Медицинское приложение.',
      achievements: [
        'Разрабатывал веб-приложение на React, Redux, Next.js и Ant Design.',
        'Разрабатывал мобильную версию на React Native.',
        'Интегрировал платёжные системы в медицинское приложение.',
      ],
    },
  ],
  projects: [
    {
      name: 'CV GraphQL API',
      description: 'Эта визитка: GraphQL API на NestJS, Prisma и PostgreSQL с батчингом вложенных запросов через DataLoader.',
      url: 'https://cv-graphql-arv2.onrender.com/graphql',
      repoUrl: 'https://github.com/sergaik-web/cv-graphql',
      stack: ['TypeScript', 'NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'Docker'],
    },
    {
      name: 'YURAL Parts Search',
      description: 'Поиск автозапчастей по артикулу через API Favorit Parts (тестовое задание).',
      url: 'https://sergaik-web.github.io/yural-parts-search/',
      repoUrl: 'https://github.com/sergaik-web/yural-parts-search',
      stack: ['React', 'Redux Toolkit', 'Bootstrap', 'Vite'],
    },
    {
      name: 'Редактор схем производства',
      description: 'Графический редактор схем для промышленной АРМ-системы (коммерческий проект CRYXXEN, код закрыт).',
      stack: ['Angular 17', 'Canvas', 'TypeScript'],
    },
    {
      name: 'Корпоративный AI-чат-бот',
      description: 'Бот для сотрудников с доступом к нескольким LLM-провайдерам (коммерческий проект CRYXXEN, код закрыт).',
      stack: ['OpenAI API', 'Gemini API', 'DeepSeek API', 'Discord'],
    },
    {
      name: 'Агрегатор OGGO',
      description: 'Веб-платформа и мобильные приложения агрегатора (коммерческий проект, код закрыт).',
      stack: ['React', 'Next.js', 'NestJS', 'React Native'],
    },
  ],
};
