import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

declare var createAnalytics: (analyticsTrackingId: string) => void;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() { }

  init() {
    const analyticsTrackingId = environment.googleTrackingId;
    createAnalytics(analyticsTrackingId);
  }
}
