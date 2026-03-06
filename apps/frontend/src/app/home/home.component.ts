import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api/api.service';
import { DailyStat, PagedResponse } from '../api/api.types';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, distinctUntilChanged, debounceTime } from 'rxjs';
import { RouterLink } from '@angular/router';

type SortKey =
  | 'date'
  | 'totalConsumptionMWh'
  | 'totalProductionMWh'
  | 'avgPriceEurPerMWh'
  | 'longestNegativePriceStreakHours';

type SortDir = 'asc' | 'desc';

/**
 * Search formats supported:
 * - YYYY
 * - YYYY-MM   (MM 01-12)
 * - YYYY-MM-DD (MM 01-12, DD 01-31; then validated by real calendar rules below)
 */
const SEARCH_RE = /^(\d{4})(?:-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?)?$/;
const DATE_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

function isValidIsoDate(date: string): boolean {
  const m = DATE_RE.exec(date);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;
  if (month < 1 || month > 12) return false;
  const dim = daysInMonth(year, month);
  return day >= 1 && day <= dim;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly page = signal(1);
  readonly pageSize = signal(20);

  readonly sort = signal<SortKey>('date');
  readonly dir = signal<SortDir>('desc');

  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');

  readonly qInput = signal<string>('');
  readonly q = signal<string>('');

  readonly metaVm$ = this.api
    .getMeta()
    .pipe(catchError(() => of({ db: 'error' as const, table: 'unknown', rowCount: 0 })));

  constructor() {
    toObservable(this.qInput)
      .pipe(
        map((v) => (typeof v === 'string' ? v.trim() : '')),
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((v) => {
        this.q.set(v);
        this.page.set(1);
      });
  }

  private readonly qNormalized = computed(() => {
    const s = this.q().trim();
    if (!s) return undefined;
    if (!SEARCH_RE.test(s)) return undefined;
    if (s.length === 10) return isValidIsoDate(s) ? s : undefined;
    return s;
  });

  private readonly dateFromNormalized = computed(() => {
    const s = this.dateFrom().trim();
    if (!s) return undefined;
    return isValidIsoDate(s) ? s : undefined;
  });

  private readonly dateToNormalized = computed(() => {
    const s = this.dateTo().trim();
    if (!s) return undefined;
    return isValidIsoDate(s) ? s : undefined;
  });

  readonly searchError = computed(() => {
    const s = this.q().trim();
    if (!s) return '';
    if (!SEARCH_RE.test(s)) return 'Search must be YYYY, YYYY-MM, or YYYY-MM-DD';
    if (s.length === 10 && !isValidIsoDate(s)) return 'Search date is not a valid calendar date';
    return '';
  });

  readonly dateRangeError = computed(() => {
    const fromRaw = this.dateFrom().trim();
    const toRaw = this.dateTo().trim();

    if (fromRaw && !this.dateFromNormalized()) return 'Date from must be a valid YYYY-MM-DD';
    if (toRaw && !this.dateToNormalized()) return 'Date to must be a valid YYYY-MM-DD';

    const from = this.dateFromNormalized();
    const to = this.dateToNormalized();
    if (!from || !to) return '';
    return from > to ? 'Date from must be <= Date to' : '';
  });

  private readonly clientErrorSig = computed(() => this.searchError() || this.dateRangeError());

  private readonly querySig = computed(() => ({
    page: this.page(),
    pageSize: this.pageSize(),
    sort: this.sort(),
    dir: this.dir(),
    dateFrom: this.dateFromNormalized(),
    dateTo: this.dateToNormalized(),
    q: this.qNormalized(),
  }));

  private readonly vmDriverSig = computed(() => ({
    query: this.querySig(),
    clientError: this.clientErrorSig(),
  }));

  readonly vm$ = toObservable(this.vmDriverSig).pipe(
    distinctUntilChanged((a, b) => {
      const aq = a.query;
      const bq = b.query;
      return (
        a.clientError === b.clientError &&
        aq.page === bq.page &&
        aq.pageSize === bq.pageSize &&
        aq.sort === bq.sort &&
        aq.dir === bq.dir &&
        aq.dateFrom === bq.dateFrom &&
        aq.dateTo === bq.dateTo &&
        aq.q === bq.q
      );
    }),
    switchMap(({ query, clientError }) => {
      const empty: PagedResponse<DailyStat> = {
        items: [],
        page: query.page,
        pageSize: query.pageSize,
        totalItems: 0,
        totalPages: 0,
      };

      if (clientError) {
        return of({ data: empty, error: clientError });
      }

      return this.api.getDailyStats(query).pipe(
        map((data) => ({ data, error: '' })),
        catchError((err) => {
          const msg = err?.error?.message || err?.message || 'Unknown error';
          return of({ data: empty, error: msg });
        }),
      );
    }),
  );

  onDateFrom(v: string) {
    this.dateFrom.set(v);
    this.page.set(1);
  }

  onDateTo(v: string) {
    this.dateTo.set(v);
    this.page.set(1);
  }

  onSearchInput(v: string) {
    this.qInput.set(v);
  }

  onPageSize(v: string) {
    const n = Number(v);
    const safe = Number.isFinite(n) ? Math.min(200, Math.max(1, Math.trunc(n))) : 20;
    this.pageSize.set(safe);
    this.page.set(1);
  }

  toggleSort(key: SortKey) {
    if (this.sort() === key) {
      this.dir.set(this.dir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sort.set(key);
      this.dir.set('desc');
    }
    this.page.set(1);
  }

  sortIndicator(key: SortKey): string {
    if (this.sort() !== key) return '';
    return this.dir() === 'asc' ? '▲' : '▼';
  }

  prevPage() {
    this.page.set(Math.max(1, this.page() - 1));
  }

  nextPage(totalPages: number) {
    if (totalPages <= 0) return;
    this.page.set(Math.min(totalPages, this.page() + 1));
  }

  reset() {
    this.qInput.set('');
    this.q.set('');

    this.page.set(1);
    this.pageSize.set(20);
    this.sort.set('date');
    this.dir.set('desc');
    this.dateFrom.set('');
    this.dateTo.set('');
  }
}
