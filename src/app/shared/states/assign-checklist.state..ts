import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import {
  CreateAssignCheckList, UpdateAssignedCheckList,
  RequestSuccess, RequestError
} from './assign-checklist.actions';
import { AssignChecklist, AssignChecklistDefaults } from '../models/assign-checklist.model';

import { AssignChecklistService } from '../services/assign-checklist.service';
import { GlobalService } from "../services/global.service";

export class AssignChecklistStateModel {
  checklist: AssignChecklist[];
  current: AssignChecklist;
  pagination?: {};
}

@State<AssignChecklistStateModel>({
  name: 'assignedchecklist',
  defaults: {
    checklist: [],
    current: AssignChecklistDefaults,
    pagination: {}
  }
})
@Injectable()
export class AssignCheckListState {
  constructor(
    private _assignCheckListService: AssignChecklistService,
    private _globalService: GlobalService
  ) { }

  @Selector()
  static checklist(state: AssignChecklistStateModel): any[] {
    return state.checklist;
  }

  @Selector()
  static current(state: AssignChecklistStateModel): {} {
    return state.current;
  }

  @Selector()
  static pagination(state: AssignChecklistStateModel): {} {
    return state.pagination;
  }

  @Action(CreateAssignCheckList, { cancelUncompleted: true })
  createAssignCheckList({ dispatch }: StateContext<AssignChecklistStateModel>, { data }: CreateAssignCheckList): void {
    this._assignCheckListService.createAssignCheckList(data).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          dispatch(new RequestSuccess(response.message));
        }
      },
      (response: any) => {
        if (response && response.error) {
          const error = response.error;
          error.code = response.status;

          dispatch(new RequestError(error.message));
        }
      },
    );
  }

  @Action(UpdateAssignedCheckList, { cancelUncompleted: true })
  updateAssignedChecklist({ patchState, dispatch }: StateContext<AssignChecklistStateModel>, { id, userChecklist }: UpdateAssignedCheckList): void {
    this._assignCheckListService.updateAssignedChecklist(id, userChecklist).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            current: response.data
          });
          dispatch(new RequestSuccess(response.message));
        }
      },
      (response: any) => {
        if (response && response.error) {
          const error = response.error;
          error.code = response.status;
          dispatch(new RequestError(error.message));
        }
      },
    );
  }

  @Action(RequestSuccess)
  requestSuccess({ getState, dispatch }: StateContext<AssignChecklistStateModel>, { message, navigate }: RequestSuccess): void {
    const state = getState();
    if (message) {
      this._globalService.openSnackBar(message);
    }

    if (navigate) {
      dispatch(new Navigate([navigate]));
    }
  }

  @Action(RequestError)
  requestError({ getState, dispatch }: StateContext<AssignChecklistStateModel>, { message, navigate }: RequestError): void {
    const state = getState();
    if (message) {
      this._globalService.openSnackBar(message);
    }

    if (navigate) {
      dispatch(new Navigate([navigate]));
    }
  }
}