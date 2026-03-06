import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-day-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './day-summary.html',
  styleUrls: ['./day-summary.scss'],
})
export class DaySummaryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  summary$ = this.route.paramMap.pipe(
    map((pm) => pm.get('date') ?? ''),
    switchMap((date) => this.api.getDaySummary(date)),
  );

  formatHour(value: string): string {
    return value.slice(11, 16);
  }
}
