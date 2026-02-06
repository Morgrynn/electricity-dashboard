import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main style="padding: 24px; font-family: system-ui, sans-serif;">
      <h1>Electricity Dashboard</h1>

      <section style="margin-top: 16px;">
        <h2>Backend connectivity</h2>

        <ng-container *ngIf="meta$ | async as meta; else loading">
          <p><strong>DB:</strong> {{ meta.db }}</p>
          <p><strong>Table:</strong> {{ meta.table }}</p>
          <p><strong>Row count:</strong> {{ meta.rowCount }}</p>
        </ng-container>

        <ng-template #loading>
          <p>Loading…</p>
        </ng-template>
      </section>
    </main>
  `,
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  readonly meta$ = this.api.getMeta();
}
