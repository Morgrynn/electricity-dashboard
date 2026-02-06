import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetaResponse } from './api.types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getMeta(): Observable<MetaResponse> {
    return this.http.get<MetaResponse>('/api/meta');
  }
}
