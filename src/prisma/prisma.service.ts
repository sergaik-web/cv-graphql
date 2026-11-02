import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('SQL');

  constructor(config: ConfigService) {
    const logQueries = config.get<string>('PRISMA_LOG_QUERIES') === 'true';
    super({ log: logQueries ? [{ emit: 'event', level: 'query' }] : [] });
    if (logQueries) {
      // Видно, сколько SQL-запросов уходит на один GraphQL-запрос — удобно проверять батчинг.
      this.$on('query', (event) => this.logger.debug(`${event.query} (${event.duration} ms)`));
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
