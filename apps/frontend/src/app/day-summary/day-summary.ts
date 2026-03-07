import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { DayChartsComponent } from './day-charts';
import { formatHourHelsinki } from './day-time';

@Component({
  selector: 'app-day-summary',
  standalone: true,
  imports: [CommonModule, DayChartsComponent],
  templateUrl: './day-summary.html',
  styleUrls: ['./day-summary.scss'],
})
export class DaySummaryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly location = inject(Location);

  readonly selectedHourStartTime = signal<string | null>(null);

  readonly date$ = this.route.paramMap.pipe(
    map((pm) => pm.get('date') ?? ''),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly summary$ = this.date$.pipe(
    switchMap((date) => this.api.getDaySummary(date)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly hours$ = this.date$.pipe(
    switchMap((date) => this.api.getDayHours(date)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  formatHour(value: string): string {
    return formatHourHelsinki(value);
  }

  goBack(): void {
    this.location.back();
  }

  selectHour(startTime: string): void {
    this.selectedHourStartTime.set(startTime);
  }

  clearSelectedHour(): void {
    this.selectedHourStartTime.set(null);
  }
}
