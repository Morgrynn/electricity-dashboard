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

export type CheapestHour = {
  startTime: string;
  price: number | null;
  rank: number;
};

export type DayHour = {
  startTime: string;
  consumptionMWh: number | null;
  productionMWh: number | null;
  priceEurPerMWh: number | null;
};
