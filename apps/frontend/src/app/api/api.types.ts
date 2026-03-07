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

export type CheapestHour = {
  startTime: string;
  price: number | null;
  rank: number;
};

export type MaxConsumptionVsProductionHour = {
  startTime: string;
  consumptionMinusProductionMWh: number;
  consumptionMWh: number;
  productionMWh: number;
  price: number | null;
};

export type DaySummary = {
  date: string;
  totalConsumptionMWh: number;
  totalProductionMWh: number;
  avgPriceEurPerMWh: number | null;
  longestNegativeStreakHours: number;
  maxConsumptionVsProductionHour: MaxConsumptionVsProductionHour | null;
  cheapestHours: CheapestHour[];
};

export type DayHour = {
  startTime: string;
  consumptionMWh: number | null;
  productionMWh: number | null;
  priceEurPerMWh: number | null;
};
