import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { DaysService } from './days.service';
import { DaySummaryDto } from './dto/day-summary.dto';
import { DayHour } from './days.model';

const isValidYmd = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

@Controller('days')
export class DaysController {
  constructor(private readonly daysService: DaysService) {}

  @Get(':date/summary')
  async getSummary(@Param('date') date: string): Promise<DaySummaryDto> {
    if (!isValidYmd(date)) {
      throw new BadRequestException(
        'Date must be a valid date in format YYYY-MM-DD',
      );
    }

    return this.daysService.getSummary(date);
  }

  @Get(':date/hours')
  async getHours(@Param('date') date: string): Promise<DayHour[]> {
    if (!isValidYmd(date)) {
      throw new BadRequestException(
        'Date must be a valid date in format YYYY-MM-DD',
      );
    }

    return this.daysService.getHours(date);
  }
}
