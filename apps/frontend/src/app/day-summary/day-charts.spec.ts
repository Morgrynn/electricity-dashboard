import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayChartsComponent } from './day-charts';

describe('DayChartsComponent', () => {
  let component: DayChartsComponent;
  let fixture: ComponentFixture<DayChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayChartsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DayChartsComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('builds one dataset for the price chart', () => {
    component.hours = [
      {
        startTime: '2024-10-01T00:00:00.000Z',
        consumptionMWh: null,
        productionMWh: 36222.32,
        priceEurPerMWh: 0,
      },
      {
        startTime: '2024-10-01T01:00:00.000Z',
        consumptionMWh: null,
        productionMWh: 27559.55,
        priceEurPerMWh: 0.001,
      },
    ];

    const data = component.priceChartData;

    expect(data.datasets).toHaveLength(1);
    expect(data.datasets[0].label).toBe('Price (€/MWh)');
    expect(data.datasets[0].data).toEqual([0, 0.001]);
  });

  it('omits the consumption dataset when all consumption values are null', () => {
    component.hours = [
      {
        startTime: '2024-10-01T00:00:00.000Z',
        consumptionMWh: null,
        productionMWh: 36222.32,
        priceEurPerMWh: 0,
      },
      {
        startTime: '2024-10-01T01:00:00.000Z',
        consumptionMWh: null,
        productionMWh: 27559.55,
        priceEurPerMWh: 0.001,
      },
    ];

    const data = component.energyChartData;

    expect(data.datasets).toHaveLength(1);
    expect(data.datasets[0].label).toBe('Production (MWh)');
  });

  it('includes both datasets when consumption values exist', () => {
    component.hours = [
      {
        startTime: '2024-10-01T00:00:00.000Z',
        consumptionMWh: 4053.07,
        productionMWh: 21688.38,
        priceEurPerMWh: 3.101,
      },
      {
        startTime: '2024-10-01T01:00:00.000Z',
        consumptionMWh: 3980.12,
        productionMWh: 21010.55,
        priceEurPerMWh: 2.4,
      },
    ];

    const data = component.energyChartData;

    expect(data.datasets).toHaveLength(2);
    expect(data.datasets[0].label).toBe('Consumption (MWh)');
    expect(data.datasets[1].label).toBe('Production (MWh)');
  });
});
