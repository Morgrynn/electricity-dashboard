import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import { DayHour } from '../api/api.types';
import { formatHourHelsinki } from './day-time';

@Component({
  selector: 'app-day-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './day-charts.html',
  styleUrls: ['./day-charts.scss'],
})
export class DayChartsComponent {
  @Input({ required: true }) hours: DayHour[] = [];
  @Input() selectedHourStartTime: string | null = null;

  private get labels(): string[] {
    return this.hours.map((h) => formatHourHelsinki(h.startTime));
  }

  private isSelected(startTime: string): boolean {
    return this.selectedHourStartTime === startTime;
  }

  private pointRadiusForValues(values: Array<number | null>): number[] {
    return values.map((value, index) => {
      if (value == null) return 0;
      return this.isSelected(this.hours[index].startTime) ? 6 : 2;
    });
  }

  private pointHoverRadiusForValues(values: Array<number | null>): number[] {
    return values.map((value, index) => {
      if (value == null) return 0;
      return this.isSelected(this.hours[index].startTime) ? 8 : 4;
    });
  }

  get priceChartData(): ChartData<'line'> {
    const priceData = this.hours.map((h) => h.priceEurPerMWh);

    return {
      labels: this.labels,
      datasets: [
        {
          label: 'Price (€/MWh)',
          data: priceData,
          spanGaps: false,
          tension: 0.2,
          pointRadius: this.pointRadiusForValues(priceData),
          pointHoverRadius: this.pointHoverRadiusForValues(priceData),
          borderWidth: 3,
          fill: false,
        },
      ],
    };
  }

  get priceChartOptions(): ChartOptions<'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (items: TooltipItem<'line'>[]) => items[0]?.label ?? '',
            label: (item: TooltipItem<'line'>) => {
              const value = item.raw;
              return value == null ? 'Price: N/A' : `Price: ${value} €/MWh`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Hour',
          },
        },
        y: {
          title: {
            display: true,
            text: '€/MWh',
          },
        },
      },
    };
  }

  get energyChartData(): ChartData<'line'> {
    const consumptionData = this.hours.map((h) => h.consumptionMWh);
    const productionData = this.hours.map((h) => h.productionMWh);

    const hasConsumptionValues = consumptionData.some((v) => v != null);
    const hasProductionValues = productionData.some((v) => v != null);

    return {
      labels: this.labels,
      datasets: [
        ...(hasConsumptionValues
          ? [
              {
                label: 'Consumption (MWh)',
                data: consumptionData,
                spanGaps: false,
                tension: 0.2,
                pointRadius: this.pointRadiusForValues(consumptionData),
                pointHoverRadius: this.pointHoverRadiusForValues(consumptionData),
                borderWidth: 3,
                fill: false,
              },
            ]
          : []),
        ...(hasProductionValues
          ? [
              {
                label: 'Production (MWh)',
                data: productionData,
                spanGaps: false,
                tension: 0.2,
                pointRadius: this.pointRadiusForValues(productionData),
                pointHoverRadius: this.pointHoverRadiusForValues(productionData),
                borderWidth: 3,
                fill: false,
              },
            ]
          : []),
      ],
    };
  }

  get energyChartOptions(): ChartOptions<'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 10,
            boxHeight: 10,
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            title: (items: TooltipItem<'line'>[]) => items[0]?.label ?? '',
            label: (item: TooltipItem<'line'>) => {
              const label = item.dataset.label ?? 'Value';
              const value = item.raw;
              return value == null ? `${label}: N/A` : `${label}: ${value} MWh`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Hour',
          },
        },
        y: {
          title: {
            display: true,
            text: 'MWh',
          },
        },
      },
    };
  }
}
