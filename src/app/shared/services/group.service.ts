import { Injectable } from '@angular/core';

import { RequestService } from './request.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(
      private _requestService: RequestService
  ) { }

  getAll(params = [], status: string): Observable<any> {
    return this._requestService.get('groups?status=' + status);
  }

  getGroup(id: string): Observable<any> {
    return this._requestService.get('groups/' + id);
  }

  getList(params = []): Observable<any> {
    return this._requestService.get('groups/list');
  }

  createGroup(data: {}): Observable<any> {
    return this._requestService.post('groups', data);
  }

  updateGroup(id: string, data: {}): Observable<any> {
    return this._requestService.put('groups/' + id, data);
  }

  deleteGroup(id: string): Observable<any> {
    return this._requestService.delete('groups/' + id);
  }
}
