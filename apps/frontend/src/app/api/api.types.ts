export interface MetaResponse {
  db: 'ok' | 'error';
  table: string;
  rowCount: number;
}

export interface DailyStat {
  date: string;
  totalConsumptionMWh: number;
  totalProductionMWh: number;
  avgPriceEurPerMWh: number | null;
  longestNegativePriceStreakHours: number;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface DailyStatsQuery {
  page?: number;
  pageSize?: number;
  sort?:
    | 'date'
    | 'totalConsumptionMWh'
    | 'totalProductionMWh'
    | 'avgPriceEurPerMWh'
    | 'longestNegativePriceStreakHours';
  dir?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}
