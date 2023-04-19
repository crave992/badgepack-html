import { Injectable } from '@angular/core';

import { RequestService } from './request.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignChecklistService {

  constructor(
    private _requestService: RequestService
  ) { }

  createAssignCheckList(data: {}): Observable<any> {
    return this._requestService.post('assigned-checklist', data);
  }
  updateAssignedChecklist(id: string, data: {}): Observable<any> {
    return this._requestService.put('assigned-checklist/' + id, data);
  }
}
