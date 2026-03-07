import { Injectable } from '@nestjs/common';
import { DbService } from '../common/db/db.service';
import { DaySummary, DayHour } from './days.model';
import { toNum0, toNumNullable } from '../common/db/db-mapper';

type TotalsRow = {
  totalConsumptionMWh: string | null;
  totalProductionMWh: string | null;
  avgPriceEurPerMWh: string | null;
};

type StreakRow = {
  longestNegativeStreakHours: number;
};

type MaxConsumptionVsProductionRow = {
  startTime: Date | string;
  consumptionMinusProductionMWh: string;
  consumptionMWh: string;
  productionMWh: string;
  price: string | null;
};

type CheapestRow = {
  startTime: Date | string;
  price: string | null;
  rank: number | string;
};

type DayHourRow = {
  startTime: Date | string;
  consumptionMWh: string | number | null;
  productionMWh: string | number | null;
  priceEurPerMWh: string | number | null;
};

@Injectable()
export class DaysRepository {
  constructor(private readonly db: DbService) {}

  async getDaySummary(
    dateStr: string,
    cheapestRanks = 3,
  ): Promise<DaySummary | null> {
    const exists = await this.db.query<{ ok: number }>(
      `SELECT 1 as ok FROM electricitydata WHERE "date" = $1::date LIMIT 1`,
      [dateStr],
    );
    if (!exists.length) return null;

    const totalSql = `
      SELECT
        CASE
          WHEN COUNT(consumptionamount) = 0 THEN NULL
          ELSE SUM(consumptionamount) / 1000.0
        END AS "totalConsumptionMWh",
        SUM(COALESCE(productionamount,0))         AS "totalProductionMWh",
        AVG(hourlyprice) FILTER (WHERE hourlyprice IS NOT NULL) AS "avgPriceEurPerMWh"
      FROM electricitydata
      WHERE "date" = $1::date;
    `;

    const streakSql = `
      WITH base AS (
        SELECT
          starttime,
          (hourlyprice < 0) AS is_negative,
          ROW_NUMBER() OVER (ORDER BY starttime) AS rn,
          ROW_NUMBER() OVER (PARTITION BY (hourlyprice < 0) ORDER BY starttime) AS rn2
        FROM electricitydata
        WHERE "date" = $1::date
      ),
      runs AS (
        SELECT
          is_negative,
          (rn - rn2) AS grp,
          COUNT(*) AS run_len
        FROM base
        GROUP BY is_negative, (rn - rn2)
      )
      SELECT COALESCE(MAX(run_len), 0)::int AS "longestNegativeStreakHours"
      FROM runs
      WHERE is_negative = true;
    `;

    const maxConsumptionVsProductionSql = `
      SELECT
        starttime AS "startTime",
        COALESCE(productionamount,0)         AS "productionMWh",
        COALESCE(consumptionamount,0)/1000.0 AS "consumptionMWh",
        hourlyprice                          AS "price",
        (COALESCE(consumptionamount,0)/1000.0) - COALESCE(productionamount,0) AS "consumptionMinusProductionMWh"
      FROM electricitydata
      WHERE "date" = $1::date
      ORDER BY "consumptionMinusProductionMWh" DESC, starttime ASC
      LIMIT 1;
    `;

    const cheapestSql = `
      WITH ranked AS (
        SELECT
          starttime AS "startTime",
          hourlyprice AS "price",
          ROW_NUMBER() OVER (ORDER BY hourlyprice ASC, starttime ASC) AS "rank"
        FROM electricitydata
        WHERE "date" = $1::date
          AND hourlyprice IS NOT NULL
      )
      SELECT "startTime", "price", "rank"
      FROM ranked
      WHERE "rank" <= $2
      ORDER BY "rank";
    `;

    const [totalsRows, streakRows, maxVsProdRows, cheapestRows] =
      await Promise.all([
        this.db.query<TotalsRow>(totalSql, [dateStr]),
        this.db.query<StreakRow>(streakSql, [dateStr]),
        this.db.query<MaxConsumptionVsProductionRow>(
          maxConsumptionVsProductionSql,
          [dateStr],
        ),
        this.db.query<CheapestRow>(cheapestSql, [dateStr, cheapestRanks]),
      ]);

    const t = totalsRows[0];
    const s = streakRows[0];
    const mv = maxVsProdRows[0];

    if (!t || !s) return null;

    return {
      date: dateStr,
      totalConsumptionMWh: toNum0(t.totalConsumptionMWh),
      totalProductionMWh: toNum0(t.totalProductionMWh),
      avgPriceEurPerMWh: toNumNullable(t.avgPriceEurPerMWh),
      longestNegativeStreakHours: s.longestNegativeStreakHours ?? 0,

      maxConsumptionVsProductionHour: mv
        ? {
            startTime:
              mv.startTime instanceof Date
                ? mv.startTime.toISOString()
                : new Date(mv.startTime).toISOString(),
            consumptionMinusProductionMWh: Number(
              mv.consumptionMinusProductionMWh,
            ),
            consumptionMWh: Number(mv.consumptionMWh),
            productionMWh: Number(mv.productionMWh),
            price: toNumNullable(mv.price),
          }
        : null,

      cheapestHours: cheapestRows.map((r) => ({
        startTime:
          r.startTime instanceof Date
            ? r.startTime.toISOString()
            : new Date(r.startTime).toISOString(),
        price: toNumNullable(r.price),
        rank: Number(r.rank),
      })),
    };
  }

  async getDayHours(dateStr: string): Promise<DayHour[] | null> {
    const rows = await this.db.query<DayHourRow>(
      `
        SELECT
          starttime AS "startTime",
          CASE
            WHEN consumptionamount IS NULL THEN NULL
            ELSE consumptionamount / 1000.0
          END AS "consumptionMWh",
          productionamount AS "productionMWh",
          hourlyprice AS "priceEurPerMWh"
        FROM electricitydata
        WHERE "date" = $1::date
        ORDER BY starttime ASC
      `,
      [dateStr],
    );

    if (!rows.length) {
      return null;
    }

    return rows.map((row) => ({
      startTime:
        row.startTime instanceof Date
          ? row.startTime.toISOString()
          : new Date(row.startTime).toISOString(),
      consumptionMWh:
        row.consumptionMWh === null ? null : Number(row.consumptionMWh),
      productionMWh:
        row.productionMWh === null ? null : Number(row.productionMWh),
      priceEurPerMWh:
        row.priceEurPerMWh === null ? null : Number(row.priceEurPerMWh),
    }));
  }
}
