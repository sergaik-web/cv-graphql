# CV GraphQL API — цифровая визитка

Backend-приложение, которое через GraphQL отдаёт информацию обо мне: профиль, навыки,
опыт работы с достижениями и проекты.

**Стек:** TypeScript · Node.js 22 · NestJS 11 · GraphQL (Apollo Server 5, code-first) ·
Prisma 6 · PostgreSQL 17 · Docker · DataLoader.

## Запуск с нуля

```bash
docker compose up --build
```

Откройте **Apollo Sandbox**: http://localhost:3000/graphql

При старте контейнер сам применяет миграции (`prisma migrate deploy`), заполняет базу
моими данными (идемпотентно) и запускает API. Других шагов не нужно.

Пример запроса:

```graphql
query {
  profile {
    name
    title
    description
    links { label url }
    skills { name category }
    backend: skills(category: BACKEND) { name }
    experience {
      company
      position
      period
      durationMonths
      achievements { text }
    }
    projects { name url repoUrl stack }
  }
}
```

### Локальная разработка

```bash
docker compose up -d db          # PostgreSQL на localhost:5433
cp .env.example .env
npm ci
npx prisma migrate deploy && npx prisma db seed
npm run start:dev
```

`PRISMA_LOG_QUERIES=true` выводит в лог каждый SQL-запрос — так видно, что вложенный
запрос выше выполняется ровно за 6 SQL-запросов.

### Тесты

```bash
npm test                 # модульные: батчинг DataLoader, маппинг дат, сервис
npm run test:e2e         # интеграционные на реальной БД (нужен DATABASE_URL)
```

## Архитектура и решения

```
src/
├── main.ts                  bootstrap
├── app.module.ts            конфигурация GraphQL (Apollo, Sandbox, контекст запроса)
├── prisma/                  PrismaService — единственное подключение к БД
├── profile/
│   ├── models/              GraphQL-типы (code-first)
│   ├── profile.repository   доступ к данным: все запросы Prisma здесь
│   ├── profile.service      бизнес-правила (выбор профиля, фильтр навыков)
│   ├── profile-loaders.factory  DataLoader'ы на каждый запрос
│   ├── experience.mapper    преобразование сущности в GraphQL-модель (даты, период)
│   ├── profile.resolver     Query.profile и вложенные поля профиля
│   └── experience.resolver  вложенное поле achievements
├── seed/                    данные визитки и идемпотентное заполнение БД
└── health/                  GET /health для оркестратора и хостинга
```

**Разделение ответственности.** Резолверы только связывают GraphQL с сервисом и
загрузчиками. Сервис не знает ни про GraphQL, ни про SQL. Репозиторий — единственное
место, где есть Prisma и порядок сортировки. Поэтому каждый слой тестируется отдельно,
а смена хранилища затрагивает только репозиторий.

**Вложенные данные без N+1.** Вложенные поля (`links`, `skills`, `experience`,
`projects`, `achievements`) — отдельные `@ResolveField`, и они выполняются только если
поле запрошено. Каждое такое поле грузится через DataLoader: все ключи одного «тика»
собираются в один запрос `WHERE parentId IN (...)`, результат раскладывается по ключам.
Например, достижения трёх мест работы загружаются одним запросом, а не тремя. Число
SQL-запросов зависит от формы GraphQL-запроса, а не от объёма данных. Это проверяет
e2e-тест (`expect(sqlQueries).toBe(6)`).

Загрузчики создаются заново на каждый HTTP-запрос (в `context`), чтобы кэш DataLoader
не переживал запрос и не смешивал данные разных пользователей.

*Почему не `include` по дереву запроса.* Можно разбирать `info` и строить один
`findUnique({ include })`. Это даёт 1–2 запроса, но связывает резолвер с формой SQL и
плохо работает с аргументами вложенных полей (`skills(category:)`) и с фрагментами.
DataLoader — стандартный для GraphQL подход: предсказуемое число запросов и простые
независимые резолверы.

**Фильтр навыков по категории** применяется в памяти поверх общего батча. Поэтому
`skills` и `skills(category: BACKEND)` в одном документе делят один SQL-запрос, а не
порождают отдельные.

**Схема БД.** Нормализованные таблицы с внешними ключами (`ON DELETE CASCADE`) и
индексами по полям, по которым идёт выборка (`profileId`, `experienceId`). Явное поле
`position` задаёт порядок отображения независимо от порядка вставки. Даты работы
хранятся как `DATE`, а период («12.2023 — 06.2025») и длительность вычисляются при
выдаче, а не дублируются в БД. Модель допускает несколько профилей (уникальный `slug`),
`profile` без аргументов отдаёт основной.

**Инициализация БД.** Схема меняется только миграциями Prisma, которые лежат в
репозитории. `migrate deploy` при старте безопасно применяет новые. Данные визитки
лежат в типизированном TypeScript-модуле (`seed-data.ts`). Сид пересоздаёт профиль в
одной транзакции, поэтому повторный запуск при каждом старте даёт то же состояние без
дублей. Сид собирается вместе с приложением и запускается через `node`, поэтому
ts-node в production-образ не попадает.

**Apollo Sandbox в production.** Визитка публичная, поэтому Sandbox и интроспекция
включены явно. В закрытом API я бы отключил их для production.

**Docker.** Multi-stage сборка: в итоговом образе только production-зависимости и
собранный код, процесс запускается не от root, есть healthcheck на `/health`.
`docker-compose` ждёт готовности PostgreSQL (`service_healthy`).

**Code-first GraphQL.** Типы схемы описаны TypeScript-классами, поэтому нет
рассинхрона между схемой и кодом. Сгенерированная схема сохраняется в `schema.gql` и
видна при ревью.

## Деплой

В репозитории есть `render.yaml` (Render Blueprint): PostgreSQL и веб-сервис из
Dockerfile, миграции и сид выполняются при старте контейнера.
