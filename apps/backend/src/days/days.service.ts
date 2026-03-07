import { Injectable, NotFoundException } from '@nestjs/common';
import { DaysRepository } from './days.repository';
import { DaySummaryDto } from './dto/day-summary.dto';
import { DayHour } from './days.model';

@Injectable()
export class DaysService {
  constructor(private readonly daysRepo: DaysRepository) {}

  async getSummary(date: string): Promise<DaySummaryDto> {
    const res = await this.daysRepo.getDaySummary(date, 3);

    if (!res) throw new NotFoundException(`No data for date ${date}`);
    return res;
  }

  async getHours(date: string): Promise<DayHour[]> {
    const res = await this.daysRepo.getDayHours(date);

    if (!res) throw new NotFoundException(`No hourly data for date ${date}`);
    return res;
  }
}
