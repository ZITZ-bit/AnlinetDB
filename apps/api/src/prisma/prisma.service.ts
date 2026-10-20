import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { join } from 'node:path';

const defaultDbUrl = `file:${join(__dirname, '..', '..', 'prisma', 'database', 'dev.db')}`;

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? defaultDbUrl,
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
