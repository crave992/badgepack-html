import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import {
  DashboardClaims, DashboardExpires, DashboardBoards,
  RequestSuccess, RequestError,
  DashboardBadgesBoards, DashboardPartials, DashboardUserAcquiredeBadges,
  DashboardUserAvailableBadges
} from './dashboard.actions';

import { GlobalService } from '../services/global.service';
import { BadgeService } from '../services/badge.service';

export class DashboardStateModel {
  available: any[];
  acquired: any[];
  claims: any[];
  partials: any[];
  expires: any[];
  boards: any[];
}

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults: {
    available: [],
    acquired: [],
    claims: [],
    partials: [],
    expires: [],
    boards: []
  }
})
@Injectable()
export class DashboardState {
  constructor(
    private _globalService: GlobalService,
    private _badgeService: BadgeService
  ) { }

  @Selector()
  static claims(state: DashboardStateModel): any[] {
    return state.claims;
  }

  @Selector()
  static available(state: DashboardStateModel): any[] {
    return state.available;
  }

  @Selector()
  static acquired(state: DashboardStateModel): any[] {
    return state.acquired;
  }

  @Selector()
  static partials(state: DashboardStateModel): any[] {
    return state.partials;
  }

  @Selector()
  static expires(state: DashboardStateModel): any[] {
    return state.expires;
  }

  @Selector()
  static boards(state: DashboardStateModel): any[] {
    return state.boards;
  }

  @Action(DashboardUserAvailableBadges, { cancelUncompleted: true })
  dashboardUserAvailableBadges({ patchState, dispatch }: StateContext<DashboardStateModel>,
    { status, params, data }: DashboardUserAvailableBadges): void {
    this._badgeService.getUserAvailableBadges(params, data).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            available: response.data
          });
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

  @Action(DashboardUserAcquiredeBadges, { cancelUncompleted: true })
  dashboardUserAcquiredBadges({ patchState, dispatch }: StateContext<DashboardStateModel>,
    { status, params, data }: DashboardUserAcquiredeBadges): void {
    this._badgeService.getUserAcquiredBadges(params, data).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            acquired: response.data.badges
          });
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

  @Action(DashboardClaims, { cancelUncompleted: true })
  dashboardClaims({ patchState, dispatch }: StateContext<DashboardStateModel>,
    { status, params, data }: DashboardClaims): void {
    this._badgeService.myActiveBadges(params, data).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            claims: response.data
          });
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

  @Action(DashboardPartials, { cancelUncompleted: true })
  dashboardPartials({ patchState, dispatch }: StateContext<DashboardStateModel>,
    { status, params, data }: DashboardPartials): void {
    this._badgeService.myPartialBadges(params, data).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            partials: response.data
          });
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

  @Action(DashboardExpires, { cancelUncompleted: true })
  dashboardExpires({ patchState, dispatch }: StateContext<DashboardStateModel>,
    { status, params, data }: DashboardExpires): void {
    this._badgeService.myExpiredBadges(params, data).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            expires: response.data
          });
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

  @Action(DashboardBoards, { cancelUncompleted: true })
  dashboardBoards({ patchState, dispatch }: StateContext<DashboardStateModel>,
    { params }: DashboardBoards): void {
    this._badgeService.boards(params).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            boards: response.data
          });
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

  @Action(DashboardBadgesBoards, { cancelUncompleted: true })
  dashboardBadgesBoards({ patchState, dispatch }: StateContext<DashboardStateModel>,
    { params, labelId }: DashboardBadgesBoards): void {
    this._badgeService.getBoards(params, labelId).subscribe(
      (response: any) => {
        if (response && response.status === 'success') {
          patchState({
            boards: response.data
          });
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
  requestSuccess({ getState, dispatch }: StateContext<DashboardStateModel>,
    { message, navigate }: RequestSuccess): void {
    const state = getState();
    if (message) {
      this._globalService.openSnackBar(message);
    }

    if (navigate) {
      dispatch(new Navigate([navigate]));
    }
  }

  @Action(RequestError)
  requestError({ getState, dispatch }: StateContext<DashboardStateModel>,
    { message, navigate }: RequestError): void {
    const state = getState();
    if (message) {
      this._globalService.openSnackBar(message);
    }

    if (navigate) {
      dispatch(new Navigate([navigate]));
    }
  }
}
