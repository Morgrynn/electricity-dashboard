import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DailyStat,
  DailyStatsQuery,
  DaySummary,
  MetaResponse,
  PagedResponse,
  DayHour,
} from './api.types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getMeta(): Observable<MetaResponse> {
    return this.http.get<MetaResponse>(`${this.base}/api/meta`);
  }

  getDailyStats(query: DailyStatsQuery): Observable<PagedResponse<DailyStat>> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }

    return this.http.get<PagedResponse<DailyStat>>(`${this.base}/api/daily-stats`, { params });
  }

  getDaySummary(date: string): Observable<DaySummary> {
    return this.http.get<DaySummary>(`${this.base}/api/days/${date}/summary`);
  }

  getDayHours(date: string): Observable<DayHour[]> {
    return this.http.get<DayHour[]>(`${this.base}/api/days/${date}/hours`);
  }
}
