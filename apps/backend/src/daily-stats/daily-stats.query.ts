import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class DailyStatsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number = 20;

  @IsOptional()
  @IsIn([
    'date',
    'totalConsumptionMWh',
    'totalProductionMWh',
    'avgPriceEurPerMWh',
    'longestNegativePriceStreakHours',
  ])
  sort?: string = 'date';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  dir?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateFrom must be YYYY-MM-DD' })
  dateFrom?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateTo must be YYYY-MM-DD' })
  dateTo?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(10)
  @Matches(/^\d{4}(-\d{2}){0,2}$/, {
    message: 'q must be YYYY, YYYY-MM, or YYYY-MM-DD',
  })
  q?: string;
}
