import { Injectable } from '@angular/core';

import { RequestService } from './request.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
      private _requestService: RequestService
  ) { }

  getAll(params = [], status: string): Observable<any> {
    return this._requestService.get('users?status=' + status);
  }

  getUser(id: string): Observable<any> {
    return this._requestService.get('users/' + id + '/badgeProfile');
  }

  getUserOnly(id: string): Observable<any> {
    return this._requestService.get('users/' + id);
  }

  getList(params = []): Observable<any> {
    return this._requestService.get('users/list');
  }

  createUser(data: {}): Observable<any> {
    return this._requestService.post('users', data);
  }

  updateUser(id: string, data: {}): Observable<any> {
    return this._requestService.put('users/' + id, data);
  }

  updateUserProfile(id: string, data: {}): Observable<any> {
    return this._requestService.put('users/' + id + '/my-profile', data);
  }

  deleteUser(id: string): Observable<any> {
    return this._requestService.delete('users/' + id);
  }
}
