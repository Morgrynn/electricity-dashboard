export class CheapestHourDto {
  startTime!: string;
  price!: number | null;
  rank!: number;
}

export class MaxConsumptionVsProductionHourDto {
  startTime!: string;
  consumptionMinusProductionMWh!: number;
  consumptionMWh!: number;
  productionMWh!: number;
  price!: number | null;
}

export class DaySummaryDto {
  date!: string;
  totalConsumptionMWh!: number;
  totalProductionMWh!: number;
  avgPriceEurPerMWh!: number | null;
  longestNegativeStreakHours!: number;
  maxConsumptionVsProductionHour!: MaxConsumptionVsProductionHourDto | null;
  cheapestHours!: CheapestHourDto[];
}
