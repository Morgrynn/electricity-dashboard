import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../api/api.service';
import { DayHour } from '../api/api.types';
import { DayChartsComponent } from './day-charts';
import { DaySummaryComponent } from './day-summary';

@Component({
  selector: 'app-day-charts',
  standalone: true,
  template: '',
})
class DayChartsStubComponent {
  @Input() hours: DayHour[] = [];
  @Input() selectedHourStartTime: string | null = null;
}

describe('DaySummaryComponent', () => {
  let component: DaySummaryComponent;
  let fixture: ComponentFixture<DaySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaySummaryComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ date: '2024-09-26' })),
          },
        },
        {
          provide: ApiService,
          useValue: {
            getDaySummary: () =>
              of({
                date: '2024-09-26',
                totalConsumptionMWh: 116276.3,
                totalProductionMWh: 805731.62,
                avgPriceEurPerMWh: 2.845,
                longestNegativeStreakHours: 6,
                maxConsumptionVsProductionHour: null,
                cheapestHours: [],
              }),
            getDayHours: () => of([]),
          },
        },
      ],
    })
      .overrideComponent(DaySummaryComponent, {
        remove: {
          imports: [DayChartsComponent],
        },
        add: {
          imports: [DayChartsStubComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DaySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats hour from backend timestamp string', () => {
    expect(component.formatHour('2024-09-26T02:00:00')).toBe('02:00');
  });
});
