import { Injectable } from '@nestjs/common';
import { DailyStatsRepository } from './daily-stats.repository';
import { DailyStatsQuery } from './daily-stats.query';
import { DailyStats } from './daily-stats.model';
import { PagedResponse } from '../common/pagination/paged-response.model';

@Injectable()
export class DailyStatsService {
  constructor(private readonly repo: DailyStatsRepository) {}

  getDailyStats(query: DailyStatsQuery): Promise<PagedResponse<DailyStats>> {
    return this.repo.findDailyStats(query);
  }
}
