import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DaySummaryComponent } from './day-summary/day-summary';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'day/:date', component: DaySummaryComponent },
  { path: '**', redirectTo: '' },
];
