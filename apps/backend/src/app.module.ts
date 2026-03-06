import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './common/db/db.module';
import { HealthController } from './health.controller';
import { MetaController } from './meta/meta.controller';
import { DailyStatsModule } from './daily-stats/daily-stats.module';
import { DaysModule } from './days/days.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/backend/.env'],
    }),
    DbModule,
    DailyStatsModule,
    DaysModule,
  ],
  controllers: [HealthController, MetaController],
})
export class AppModule {}
