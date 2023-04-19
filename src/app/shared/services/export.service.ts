import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
    constructor(
        private _requestService: RequestService
    ) { }
  
    exportUsers(params = []): Observable<any> {
      return this._requestService.get('users?status=all');
    }

    exportGroups(params = []): Observable<any> {
      return this._requestService.get('groups');
    }

    exportBadges(params = []): Observable<any> {
      return this._requestService.get('badges?status=all');
    }
}