/**
 * Aggregated daily electricity statistics.
 *
 * Units:
 * - totalConsumptionMWh: MWh
 * - totalProductionMWh: MWh
 * - avgPriceEurPerMWh: €/MWh (null when no hourlyPrice exists for the day)
 * - longestNegativePriceStreakHours: hours
 */
export interface DailyStats {
  /** Calendar date (YYYY-MM-DD) based on electricityData.date. */
  date: string;

  /** Null when the dataset contains no consumptionAmount values for the day. */
  totalConsumptionMWh: number | null;
  totalProductionMWh: number;

  /** Null when no hourlyPrice datapoints exist for that day. */
  avgPriceEurPerMWh: number | null;

  longestNegativePriceStreakHours: number;
}
