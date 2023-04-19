import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { take, tap, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { GetCheckLists, GetCheckList, GetBadgeQuizList, CreateCheckList, UpdateCheckList, DeleteCheckList, RequestSuccess, RequestError } from './checkList.actions';
import { CheckList, CheckListDefaults } from '../models/checkList.model';

import { CheckListService } from '../services/check-list.service';
import { GlobalService } from "../services/global.service";

export class CheckListStateModel {
  checklist: CheckList[];
  current: CheckList;
  pagination?: {};
}

@State<CheckListStateModel>({
  name: 'checklist',
  defaults: {
    checklist: [],
    current: CheckListDefaults,
    pagination: {}
  }
})
@Injectable()
export class CheckListState {
  constructor(
    private _checkListService: CheckListService,
    private _globalService: GlobalService
  ) { }

  @Selector()
  static checklist(state: CheckListStateModel): any[] {
    return state.checklist;
  }

  @Selector()
  static current(state: CheckListStateModel): {} {
    return state.current;
  }

  @Selector()
  static pagination(state: CheckListStateModel): {} {
    return state.pagination;
  }

  @Action(GetCheckLists, { cancelUncompleted: true })
  getCheckLists({ patchState, dispatch }: StateContext<CheckListStateModel>, { params }: GetCheckLists): Observable<any> {
    return this._checkListService.listChecklist(params).pipe(
      take(1),
      tap((response: any) => {
        if (response && response.status === 'success') {
          const newCheckListDefaults = Object.assign({}, CheckListDefaults);
          const pagination = Object.assign({}, response);

          delete pagination.data;
          delete pagination.status;
          delete pagination.message;

          patchState({
            checklist: response.data,
            current: newCheckListDefaults,
            pagination
          });
        }
      }),
      catchError((response) => throwError(response.error))
    );
  }

  @Action(GetBadgeQuizList, { cancelUncompleted: true })
  getBadgeQuizList({ patchState, dispatch }: StateContext<CheckListStateModel>, { id, checklistId }: GetBadgeQuizList): void {
    this._checkListService.getBadgeQuizList(id, checklistId).subscribe(
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

  @Action(GetCheckList, { cancelUncompleted: true })
  getBadge({ patchState, dispatch }: StateContext<CheckListStateModel>, { id }: GetCheckList): void {
    this._checkListService.getChecklist(id).subscribe(
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

  @Action(CreateCheckList, { cancelUncompleted: true })
  createCheckList({ dispatch }: StateContext<CheckListStateModel>, { checklist, checklistId }: CreateCheckList): void {
    this._checkListService.createChecklist(checklist, checklistId).subscribe(
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

  @Action(UpdateCheckList, { cancelUncompleted: true })
  updateBadge({ patchState, dispatch }: StateContext<CheckListStateModel>, { id, checklist }: UpdateCheckList): void {
    this._checkListService.updateChecklist(id, checklist).subscribe(
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
  requestSuccess({ getState, dispatch }: StateContext<CheckListStateModel>, { message, navigate }: RequestSuccess): void {
    const state = getState();
    if (message) {
      this._globalService.openSnackBar(message);
    }

    if (navigate) {
      dispatch(new Navigate([navigate]));
    }
  }

  @Action(RequestError)
  requestError({ getState, dispatch }: StateContext<CheckListStateModel>, { message, navigate }: RequestError): void {
    const state = getState();
    if (message) {
      this._globalService.openSnackBar(message);
    }

    if (navigate) {
      dispatch(new Navigate([navigate]));
    }
  }

  @Action(DeleteCheckList, { cancelUncompleted: true })
  deleteCheckList({ dispatch }: StateContext<CheckListStateModel>, { id }: DeleteCheckList): void {
    this._checkListService.deleteChecklist(id).subscribe(
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
}
