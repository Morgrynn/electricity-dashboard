import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { DailyStatsQuery } from './daily-stats.query';
import { DailyStats } from './daily-stats.model';
import { PagedResponse } from '../common/pagination/paged-response.model';

@Injectable()
export class DailyStatsRepository {
  constructor(private readonly db: DbService) {}

  async findDailyStats(
    query: DailyStatsQuery,
  ): Promise<PagedResponse<DailyStats>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const dateFrom = query.dateFrom ?? null;
    const dateTo = query.dateTo ?? null;
    const q = query.q || null;

    const { expr: sortExpr, nulls } = this.sortOrder(query.sort ?? 'date');
    const dir = (query.dir ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countSql = `
      WITH base_days AS (
        SELECT date::date AS day
        FROM electricitydata
        WHERE 1=1
          AND ($1::date IS NULL OR date >= $1::date)
          AND ($2::date IS NULL OR date <= $2::date)
          AND (
            $3::text IS NULL
            OR to_char(date, 'YYYY-MM-DD') LIKE $3::text || '%'
          )
        GROUP BY date::date
      )
      SELECT COUNT(*)::int AS total_days
      FROM base_days;
    `;

    const dataSql = `
      WITH base AS (
        SELECT
          date::date                      AS day,
          starttime                       AS start_time,
          COALESCE(productionamount, 0)   AS production_mwh,
          COALESCE(consumptionamount, 0)  AS consumption_kwh,
          hourlyprice                     AS price
        FROM electricitydata
        WHERE 1=1
          AND ($1::date IS NULL OR date >= $1::date)
          AND ($2::date IS NULL OR date <= $2::date)
          AND (
            $3::text IS NULL
            OR to_char(date, 'YYYY-MM-DD') LIKE $3::text || '%'
          )
      ),
      neg_groups AS (
        SELECT
          day,
          start_time,
          (
            EXTRACT(EPOCH FROM start_time) / 3600
            - ROW_NUMBER() OVER (PARTITION BY day ORDER BY start_time)
          ) AS grp
        FROM base
        WHERE price < 0
      ),
      neg_streaks AS (
        SELECT
          day,
          MAX(streak_len) AS longest_negative_hours
        FROM (
          SELECT
            day,
            grp,
            COUNT(*) AS streak_len
          FROM neg_groups
          GROUP BY day, grp
        ) s
        GROUP BY day
      ),
      daily AS (
        SELECT
          b.day,
          SUM(b.consumption_kwh) / 1000.0                 AS total_consumption_mwh,
          SUM(b.production_mwh)                           AS total_production_mwh,
          AVG(b.price) FILTER (WHERE b.price IS NOT NULL) AS avg_price_eur_per_mwh
        FROM base b
        GROUP BY b.day
      )
      SELECT
        d.day::text                          AS "date",
        d.total_consumption_mwh              AS "totalConsumptionMWh",
        d.total_production_mwh               AS "totalProductionMWh",
        d.avg_price_eur_per_mwh              AS "avgPriceEurPerMWh",
        COALESCE(n.longest_negative_hours, 0)::int
                                            AS "longestNegativePriceStreakHours"
      FROM daily d
      LEFT JOIN neg_streaks n ON n.day = d.day
      ORDER BY ${sortExpr} ${dir} ${nulls ?? ''}
      LIMIT $4 OFFSET $5;
    `;

    const params = [dateFrom, dateTo, q, pageSize, offset];

    const [countRows, dataRows] = await Promise.all([
      this.db.query<{ total_days: number }>(countSql, [dateFrom, dateTo, q]),
      this.db.query<DailyStats>(dataSql, params),
    ]);

    const totalItems = countRows[0]?.total_days ?? 0;

    return {
      items: dataRows.map((r) => ({
        date: r.date,
        totalConsumptionMWh: Number(r.totalConsumptionMWh),
        totalProductionMWh: Number(r.totalProductionMWh),
        avgPriceEurPerMWh:
          r.avgPriceEurPerMWh === null || r.avgPriceEurPerMWh === undefined
            ? null
            : Number(r.avgPriceEurPerMWh),
        longestNegativePriceStreakHours: Number(
          r.longestNegativePriceStreakHours,
        ),
      })),
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  private sortOrder(sort: DailyStatsQuery['sort']): {
    expr: string;
    nulls?: 'NULLS LAST' | 'NULLS FIRST';
  } {
    switch (sort) {
      case 'date':
        return { expr: 'd.day' };

      case 'totalConsumptionMWh':
        return { expr: 'd.total_consumption_mwh' };

      case 'totalProductionMWh':
        return { expr: 'd.total_production_mwh' };

      case 'avgPriceEurPerMWh':
        return { expr: 'd.avg_price_eur_per_mwh', nulls: 'NULLS LAST' };

      case 'longestNegativePriceStreakHours':
        return { expr: 'n.longest_negative_hours', nulls: 'NULLS LAST' };

      default:
        return { expr: 'd.day' };
    }
  }
}
