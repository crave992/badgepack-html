import { Injectable } from '@angular/core';

import { RequestService } from './request.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

    constructor(
        private _requestService: RequestService
    ) { }

    credits(params = []): Observable<any> {
        return this._requestService.post('reports/credits', params);
    }

    redeems(params = []): Observable<any> {
        return this._requestService.post('reports/redeems', params);
    }

    users(params = []): Observable<any> {
        return this._requestService.post('reports/users', params);
    }

    badges(params = []): Observable<any> {
        return this._requestService.post('reports/badges', params);
    }
}
