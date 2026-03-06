import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { ApiService } from '../api/api.service';
import { DailyStat, PagedResponse } from '../api/api.types';

describe('HomeComponent', () => {
  const emptyPage: PagedResponse<DailyStat> = {
    items: [],
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  };

  let getMeta: jest.MockedFunction<ApiService['getMeta']>;
  let getDailyStats: jest.MockedFunction<ApiService['getDailyStats']>;

  beforeEach(async () => {
    getMeta = jest.fn().mockReturnValue(of({ db: 'ok', table: 'electricitydata', rowCount: 123 }));

    getDailyStats = jest.fn().mockReturnValue(of(emptyPage));

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getMeta,
            getDailyStats,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('calls getDailyStats with default query on init', fakeAsync(() => {
    const fixture = TestBed.createComponent(HomeComponent);

    fixture.detectChanges();
    tick();

    expect(getDailyStats).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      sort: 'date',
      dir: 'desc',
      dateFrom: undefined,
      dateTo: undefined,
      q: undefined,
    });
  }));

  it('toggleSort flips direction when sorting same key', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    expect(component.sort()).toBe('date');
    expect(component.dir()).toBe('desc');

    component.toggleSort('date');
    expect(component.sort()).toBe('date');
    expect(component.dir()).toBe('asc');

    component.toggleSort('date');
    expect(component.sort()).toBe('date');
    expect(component.dir()).toBe('desc');
  });

  it('toggleSort switches key and resets direction to desc', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.toggleSort('totalProductionMWh');

    expect(component.sort()).toBe('totalProductionMWh');
    expect(component.dir()).toBe('desc');
    expect(component.page()).toBe(1);
  });

  it('sortIndicator returns correct indicator', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    expect(component.sortIndicator('totalProductionMWh')).toBe('');
    expect(component.sortIndicator('date')).toBe('▼');

    component.toggleSort('date');
    expect(component.sortIndicator('date')).toBe('▲');
  });

  it('onPageSize clamps invalid values safely', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.onPageSize('300');
    expect(component.pageSize()).toBe(200);
    expect(component.page()).toBe(1);

    component.onPageSize('0');
    expect(component.pageSize()).toBe(1);

    component.onPageSize('not-a-number');
    expect(component.pageSize()).toBe(20);
  });

  it('prevPage does not go below 1', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.prevPage();
    expect(component.page()).toBe(1);

    component.page.set(3);
    component.prevPage();
    expect(component.page()).toBe(2);
  });

  it('nextPage does not exceed total pages', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.nextPage(0);
    expect(component.page()).toBe(1);

    component.nextPage(3);
    expect(component.page()).toBe(2);

    component.nextPage(3);
    component.nextPage(3);
    expect(component.page()).toBe(3);
  });

  it('reset restores defaults', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.onDateFrom('2024-01-01');
    component.onDateTo('2024-01-31');
    component.onPageSize('50');
    component.toggleSort('totalConsumptionMWh');
    component.page.set(3);
    component.onSearchInput('2024');

    component.reset();

    expect(component.qInput()).toBe('');
    expect(component.q()).toBe('');
    expect(component.page()).toBe(1);
    expect(component.pageSize()).toBe(20);
    expect(component.sort()).toBe('date');
    expect(component.dir()).toBe('desc');
    expect(component.dateFrom()).toBe('');
    expect(component.dateTo()).toBe('');
  });

  it('shows search format error for invalid search', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.q.set('abc');

    expect(component.searchError()).toBe('Search must be YYYY, YYYY-MM, or YYYY-MM-DD');
  });

  it('shows calendar error for impossible search date', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.q.set('2024-02-31');

    expect(component.searchError()).toBe('Search date is not a valid calendar date');
  });

  it('shows date range error when from is after to', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.onDateFrom('2024-03-10');
    component.onDateTo('2024-03-01');

    expect(component.dateRangeError()).toBe('Date from must be <= Date to');
  });

  it('does not call API when client-side validation fails', fakeAsync(() => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    tick();
    getDailyStats.mockClear();

    component.onDateFrom('2024-03-10');
    component.onDateTo('2024-03-01');

    fixture.detectChanges();
    tick();

    expect(getDailyStats).not.toHaveBeenCalled();
  }));

  it('debounces search input before updating q and calling API', fakeAsync(() => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    tick();
    getDailyStats.mockClear();

    component.onSearchInput('2024-09');

    expect(component.q()).toBe('');

    tick(349);
    expect(component.q()).toBe('');
    expect(getDailyStats).not.toHaveBeenCalled();

    tick(1);
    fixture.detectChanges();

    expect(component.q()).toBe('2024-09');
    expect(getDailyStats).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      sort: 'date',
      dir: 'desc',
      dateFrom: undefined,
      dateTo: undefined,
      q: '2024-09',
    });
  }));

  it('trims debounced search input', fakeAsync(() => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    tick();
    getDailyStats.mockClear();

    component.onSearchInput('  2024-09-26  ');
    tick(350);
    fixture.detectChanges();

    expect(component.q()).toBe('2024-09-26');
    expect(getDailyStats).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      sort: 'date',
      dir: 'desc',
      dateFrom: undefined,
      dateTo: undefined,
      q: '2024-09-26',
    });
  }));
});
