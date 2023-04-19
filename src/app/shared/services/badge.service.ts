import { Injectable } from '@angular/core';

import { RequestService } from './request.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  constructor(
    private _requestService: RequestService
  ) { }

  getAll(params = [], status: string): Observable<any> {
    return this._requestService.get('badges?status=' + status);
  }

  getBadge(id: string): Observable<any> {
    return this._requestService.get('badges/' + id);
  }

  getList(params = []): Observable<any> {
    return this._requestService.get('badges/list');
  }

  getLabels(params = []): Observable<any> {
    return this._requestService.get('labels');
  }

  createBadge(data: {}, file: any): Observable<any> {
    let formData;

    if (file === false) {
      formData = 'none';
    } else {
      formData = new FormData();
      formData.append('image', file, file.name);
    }
    return this._requestService.postImage('badges', data, formData);
  }

  updateBadge(id: string, data: {}): Observable<any> {
    return this._requestService.put('badges/' + id, data);
  }

  deleteBadge(id: string): Observable<any> {
    return this._requestService.delete('badges/' + id);
  }

  assignUser(badgeId: string): Observable<any> {
    return this._requestService.get('badges/' + badgeId + '/unassigned-badges');
  }

  assignBadge(data: {}): Observable<any> {
    return this._requestService.post('assigned-badges', data);
  }

  updateAssignedBadge(id: string, data: {}, action: string): Observable<any> {
    return this._requestService.put('assigned-badges/' + id, data);
  }

  getAssignedBadges(badgeId: {}, params = []): Observable<any> {
    return this._requestService.get('badges/' + badgeId + '/assigned-badges');
  }

  getMyBadges(userId: {}): Observable<any> {
    return this._requestService.get('badges/' + userId + '/my-badges');
  }

  myActiveBadges(status: string, data = {}): Observable<any> {
    return this._requestService.post('badges/my/active', data);
  }

  myPartialBadges(status: string, data = {}): Observable<any> {
    return this._requestService.post('badges/user/partial', data);
  }

  myExpiredBadges(status: string, data = {}): Observable<any> {
    return this._requestService.post('badges/my/expired', data);
  }

  boards(status: string, params = []): Observable<any> {
    return this._requestService.get('badges/boards');
  }

  getBoards(params = [], labelId: string): Observable<any> {
    return this._requestService.get(`badges/boards/${labelId}`);
  }

  board(id: string, status: string = 'active', params = []): Observable<any> {
    return this._requestService.get(`badges/${id}/board/${status}`);
  }

  deleteAssignedBadge(id: string): Observable<any> {
    return this._requestService.delete('assigned-badges/' + id);
  }

  uploadBadgeLogo(id: string, file: any): Observable<any> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this._requestService.post('badges/' + id + '/upload', formData);
  }

  getBadgeClaim(id: string): Observable<any> {
    return this._requestService.get('badges/claim/' + id);
  }

  getUserAssignedChecklist(id: string, badgeId: string): Observable<any> {
    return this._requestService.get('assigned-checklist/' + id + '/user-checklist/' + badgeId);
  }

  getUserAvailableBadges(status: string, data = {}): Observable<any> {
    return this._requestService.post('badges/user/available', data);
  }

  getUserAcquiredBadges(status: string, data = {}): Observable<any> {
    return this._requestService.post('badges/user/acquired', data);
  }

  getMainBadges(badgeId: {}, params = []): Observable<any> {
    return this._requestService.get('badges/' + badgeId + '/main-badges');
  }

  getUseraBadgePrerequisites(data = {}, id: string): Observable<any> {
    return this._requestService.post('badges/users-prerequisite-badge/' + id, data);
  }

  rewardsEvents(): Observable<any> {
    return this._requestService.get('rewards/events');
  }
}
