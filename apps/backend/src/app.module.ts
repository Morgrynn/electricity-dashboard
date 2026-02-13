import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { HealthController } from './health.controller';
import { MetaController } from './meta/meta.controller';
import { DailyStatsModule } from './daily-stats/daily-stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/backend/.env'],
    }),
    DbModule,
    DailyStatsModule,
  ],
  controllers: [HealthController, MetaController],
})
export class AppModule {}
