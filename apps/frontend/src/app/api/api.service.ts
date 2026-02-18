import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyStat, DailyStatsQuery, MetaResponse, PagedResponse } from './api.types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getMeta(): Observable<MetaResponse> {
    return this.http.get<MetaResponse>('/api/meta');
  }

  getDailyStats(query: DailyStatsQuery): Observable<PagedResponse<DailyStat>> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }

    return this.http.get<PagedResponse<DailyStat>>('/api/daily-stats', { params });
  }
}
