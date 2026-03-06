import { Module } from '@nestjs/common';
import { DailyStatsController } from './daily-stats.controller';
import { DailyStatsService } from './daily-stats.service';
import { DailyStatsRepository } from './daily-stats.repository';
import { DbModule } from '../common/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [DailyStatsController],
  providers: [DailyStatsService, DailyStatsRepository],
})
export class DailyStatsModule {}
