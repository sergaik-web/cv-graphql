import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import type { Request } from 'express';
import type { GraphQLContext } from './graphql/graphql-context';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileLoadersFactory } from './profile/profile-loaders.factory';
import { ProfileModule } from './profile/profile.module';

/** Запрос, который открывается в Apollo Sandbox по умолчанию. */
const EXAMPLE_QUERY = `query Profile {
  profile {
    name
    title
    description
    location
    links { label url }
    skills { name category }
    experience {
      company
      position
      period
      durationMonths
      achievements { text }
    }
    projects { name description url repoUrl stack }
  }
}
`;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    PrismaModule,
    ProfileModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ProfileModule],
      inject: [ProfileLoadersFactory],
      useFactory: (loadersFactory: ProfileLoadersFactory) => ({
        // Code-first: схема генерируется из TypeScript-классов. Вне production
        // она записывается в schema.gql, чтобы изменения API были видны в diff.
        autoSchemaFile:
          process.env.NODE_ENV === 'production' ? true : join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        // Визитка публичная, поэтому Apollo Sandbox и интроспекция включены и в production.
        playground: false,
        introspection: true,
        plugins: [
          ApolloServerPluginLandingPageLocalDefault({ embed: true, document: EXAMPLE_QUERY }),
        ],
        context: ({ req }: { req: Request }): GraphQLContext => ({
          req,
          loaders: loadersFactory.create(),
        }),
      }),
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
