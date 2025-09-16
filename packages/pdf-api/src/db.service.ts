import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import postgres from 'postgres';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private sql: postgres.Sql<Record<string, unknown>> | undefined;

  constructor() {}

  onModuleInit() {
    if (
      !process.env.DB_HOST ||
      !process.env.DB_NAME ||
      !Number(process.env.DB_PORT)
    ) {
      throw new Error('DB_* env vars are missing');
    }

    this.sql = postgres({
      username: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST,
      db: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
    });
  }

  async onModuleDestroy() {
    await this.sql?.end();
  }

  public Sql() {
    return this.sql!;
  }
}
