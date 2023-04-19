import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action, NgxsOnInit } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { LoginAuth, LoginSsoAuth, LogoutAuth, CheckAuth, SetToken, SetAuth, RefreshAuth, DeleteAuth, RequestSuccess, RequestError } from './auth.actions';

import { GlobalService } from '../services/global.service';
import { AuthService } from '../services/auth.service';

export class AuthStateModel {
    auth: any;
    token: string;
    logged: boolean;
}

@State<AuthStateModel>({
    name: 'auth',
    defaults: {
        auth: null,
        token: null,
        logged: false
    }
})
@Injectable()
export class AuthState implements NgxsOnInit {
    constructor(
        private _globalService: GlobalService,
        private _authService: AuthService
    ) { }

    @Selector()
    static auth(state: AuthStateModel): any {
        return state.auth;
    }

    @Selector()
    static token(state: AuthStateModel): string {
        return atob(state.token);
    }

    @Selector()
    static logged(state: AuthStateModel): boolean {
        return state.logged;
    }

    ngxsOnInit({ dispatch }: StateContext<AuthStateModel>): void {
        dispatch(new CheckAuth());
    }

    @Action(LoginAuth, { cancelUncompleted: true })
    loginAuth({ patchState, dispatch }: StateContext<AuthStateModel>, { auth }: LoginAuth): void {
        this._authService.login(auth).subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    patchState({ logged: true });
                    dispatch(new SetToken(response.token));
                    dispatch(new RequestSuccess(response.message, `/dashboard`));
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

    @Action(LoginSsoAuth, { cancelUncompleted: true })
    loginSsoAuth({ patchState, dispatch }: StateContext<AuthStateModel>, { auth }: LoginSsoAuth): void {
        this._authService.loginSso(auth).subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    patchState({ logged: true });
                    dispatch(new SetToken(response.token));
                    dispatch(new RequestSuccess(response.message, `/dashboard`));
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

    @Action(LogoutAuth, { cancelUncompleted: true })
    logoutAuth({ patchState, dispatch }: StateContext<AuthStateModel>): void {
        this._authService.logout().subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    dispatch(new DeleteAuth());

                    dispatch(new Navigate(['/auth/login']));
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

    @Action(DeleteAuth, { cancelUncompleted: true })
    deleteAuth({ dispatch }: StateContext<AuthStateModel>): void {
        localStorage.clear();

        dispatch( new CheckAuth() );
    }

    @Action(CheckAuth, { cancelUncompleted: true })
    checkAuth({ patchState, dispatch }: StateContext<AuthStateModel>): void {
        const token = localStorage.getItem('token');
        
        if (token && this._authService.check(token)) {
            const auth = JSON.parse(localStorage.getItem('auth'));

            patchState({
                token, auth, logged: true
            });
        } else {
            patchState({
                token: null, auth: null, logged: false
            });
        }
    }

    @Action(RefreshAuth, { cancelUncompleted: true })
    refreshAuth({ patchState, dispatch }: StateContext<AuthStateModel>): void {
        this._authService.refresh().subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    dispatch(new SetToken(response.token));
                    dispatch(new SetAuth(response.auth));

                    patchState({ logged: true });
                }
            },
            (response: any) => {
                if (response && response.error) {
                    const error = response.error;
                    error.code = response.status;

                    if (error.status === 'error' && error.code === 401) {
                        dispatch(new DeleteAuth());

                        dispatch(new RequestError(error.message, '/auth/login'));
                    } else {
                        dispatch(new RequestError(error.message));
                    }
                }
            },
        );
    }

    @Action(SetToken)
    setToken({ patchState }: StateContext<AuthStateModel>, { token }: SetToken): void {
        token = btoa(token);

        patchState({ token });

        localStorage.setItem('token', token);
    }

    @Action(SetAuth)
    setAuth({ patchState }: StateContext<AuthStateModel>, { auth }: SetAuth): void {
        patchState({ auth });

        localStorage.setItem('auth', JSON.stringify(auth));
    }

    @Action(RequestSuccess)
    requestSuccess({ getState, dispatch }: StateContext<AuthStateModel>, { message, navigate }: RequestSuccess): void {
        const state = getState();
        if (message) {
            this._globalService.openSnackBar(message);
        }

        if (navigate) {
            dispatch(new Navigate([navigate]));
        }
    }

    @Action(RequestError)
    requestError({ getState, dispatch }: StateContext<AuthStateModel>, { message, navigate }: RequestError): void {
        const state = getState();
        if (message) {
            this._globalService.openSnackBar(message);
        }

        if (navigate) {
            dispatch(new Navigate([navigate]));
        }
    }
}

