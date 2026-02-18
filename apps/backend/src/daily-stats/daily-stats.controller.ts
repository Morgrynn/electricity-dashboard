import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DailyStatsService } from './daily-stats.service';
import { DailyStatsQuery } from './daily-stats.query';
import { DailyStats } from './daily-stats.model';
import { PagedResponse } from '../common/pagination/paged-response.model';

@Controller('daily-stats')
export class DailyStatsController {
  constructor(private readonly service: DailyStatsService) {}

  @Get()
  getDailyStats(
    @Query() query: DailyStatsQuery,
  ): Promise<PagedResponse<DailyStats>> {
    if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
      throw new BadRequestException('dateFrom must be <= dateTo');
    }
    return this.service.getDailyStats(query);
  }
}
