import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';

import {
  GetBadges, GetBadge, NewBadge, CreateBadge, AssignBadge,
  UpdateBadge, DeleteBadge, RequestSuccess, RequestError,
  DeleteAssignedBadge, MyBadges, GetUsersBadge, UpdateAssignedBadge
} from './badge.actions';

import { Badge, BadgeDefaults } from '../models/badge.model';

import { GlobalService } from '../services/global.service';
import { BadgeService } from '../services/badge.service';

export class BadgeStateModel {
  badges: Badge[];
  current: Badge;
  pagination?: {};
}

@State<BadgeStateModel>({
  name: 'badge',
  defaults: {
    badges: [],
    current: BadgeDefaults,
    pagination: {}
  }
})
@Injectable()
export class BadgeState {
  constructor(
    private _globalService: GlobalService,
    private _badgeService: BadgeService
  ) { }

  @Selector()
  static badges(state: BadgeStateModel): any[] {
    return state.badges;
  }

  @Selector()
  static current(state: BadgeStateModel): {} {
    return state.current;
  }

  @Selector()
  static pagination(state: BadgeStateModel): {} {
    return state.pagination;
  }

  @Action(GetBadges, { cancelUncompleted: true })
  getBadges({ patchState, dispatch }: StateContext<BadgeStateModel>, { params, status }: GetBadges): void {
    this._badgeService.getAll(params, status).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          const pagination = Object.assign({}, response);

          delete pagination.data;
          delete pagination.status;
          delete pagination.message;

          patchState({
            badges: response.data,
            pagination: pagination
          });

          dispatch(new RequestSuccess(''));
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

  @Action(GetBadge, { cancelUncompleted: true })
  getBadge({ patchState, dispatch }: StateContext<BadgeStateModel>, { id }: GetBadge): void {
    this._badgeService.getBadge(id).subscribe(
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

  @Action(CreateBadge, { cancelUncompleted: true })
  createBadge({ dispatch }: StateContext<BadgeStateModel>, { badge, file }: CreateBadge): void {
    this._badgeService.createBadge(badge, file).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          if (file !== false) {
            this._badgeService.uploadBadgeLogo(response.data.id, file).subscribe(
              (res: any) => {
              }
            );
          }
          dispatch(new RequestSuccess(response.message, `/badges/${response.data.id}/edit`));
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

  @Action(AssignBadge, { cancelUncompleted: true })
  assignBadge({ dispatch }: StateContext<BadgeStateModel>, { badge }: CreateBadge): void {
    this._badgeService.assignBadge(badge).subscribe(
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

  @Action(UpdateAssignedBadge, { cancelUncompleted: true })
  updateAssignedBadge({ patchState, dispatch }: StateContext<BadgeStateModel>, { id, assignedBadge, action }: UpdateAssignedBadge): void {
    this._badgeService.updateAssignedBadge(id, assignedBadge, action).subscribe(
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

  @Action(GetUsersBadge, { cancelUncompleted: true })
  getUsersBadge({ dispatch }: StateContext<BadgeStateModel>, { badge }: GetUsersBadge): void {
    this._badgeService.assignUser(badge).subscribe(
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

  @Action(UpdateBadge, { cancelUncompleted: true })
  updateBadge({ patchState, dispatch }: StateContext<BadgeStateModel>, { id, badge }: UpdateBadge): void {
    this._badgeService.updateBadge(id, badge).subscribe(
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

  @Action(DeleteBadge, { cancelUncompleted: true })
  deleteBadge({ dispatch }: StateContext<BadgeStateModel>, { id }: DeleteBadge): void {
    this._badgeService.deleteBadge(id).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          dispatch(new RequestSuccess(response.message, '/badges'));
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

  @Action(DeleteAssignedBadge, { cancelUncompleted: true })
  deleteAssignedBadge({ dispatch }: StateContext<BadgeStateModel>, { id, badgeId }: DeleteAssignedBadge): void {
    this._badgeService.deleteAssignedBadge(id).subscribe(
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

  @Action(NewBadge)
  newBadge({ patchState }: StateContext<BadgeStateModel>): void {
    const newBadgeDefaults = Object.assign({}, BadgeDefaults);

    patchState({
      current: newBadgeDefaults
    });

  }

  @Action(MyBadges, { cancelUncompleted: true })
  myBadges({ patchState, dispatch }: StateContext<BadgeStateModel>, { userId, params }: MyBadges): void {
    this._badgeService.getMyBadges(userId).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            current: response.data
          });
          params = response.data;
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
  requestSuccess({ getState, dispatch }: StateContext<BadgeStateModel>, { message, navigate }: RequestSuccess): void {
    const state = getState();
    if (message) {
      this._globalService.openSnackBar(message);
    }

    if (navigate) {
      dispatch(new Navigate([navigate]));
    }
  }

  @Action(RequestError)
  requestError({ getState, dispatch }: StateContext<BadgeStateModel>, { message, navigate }: RequestError): void {
    const state = getState();
    if (message) {
      this._globalService.openSnackBar(message);
    }

    if (navigate) {
      dispatch(new Navigate([navigate]));
    }
  }
}
