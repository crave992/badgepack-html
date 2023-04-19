import { Params } from '@angular/router';
import { Injectable } from '@angular/core';

import { RequestService } from './request.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckListService {

  constructor(
    private _requestService: RequestService
  ) { }

  listChecklist(id: string): Observable<any> {
    return this._requestService.get('checklist/' + id);
  }

  getChecklist(id: string): Observable<any> {
    return this._requestService.get('checklist/' + id + '/get-checklist');
  }

  getBadgeQuizList(id: string, checklistId: string): Observable<any> {
    return this._requestService.get('checklist/badge/' + id + '/' + checklistId + '/quizzes');
  }

  createChecklist(data: {}, id: string): Observable<any> {
    return this._requestService.post('checklist/' + id, data);
  }

  updateChecklist(id: string, data: {}): Observable<any> {
    return this._requestService.put('checklist/' + id, data);
  }

  badgePrerequisiteList(id: string, checklist_id: string): Observable<any> {
    return this._requestService.get('assigned-checklist/' + id + '/' + checklist_id + '/badge-prerequisite');
  }

  deleteChecklist(id: string): Observable<any> {
    return this._requestService.delete('checklist/' + id);
  }
}
