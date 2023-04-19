import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { GetUsers, GetUser, NewUser, CreateUser, UpdateUser, DeleteUser, RequestSuccess, RequestError, GetUserOnly, UpdateUserProfile } from './user.actions';
import { User, UserDefaults } from '../models/user.model';

import { GlobalService } from '../services/global.service';
import { UserService } from '../services/user.service';

export class UserStateModel {
    users: User[];
    current: User;
    pagination?: {};
}

@State<UserStateModel>({
    name: 'user',
    defaults: {
        users: [],
        current: UserDefaults,
        pagination: {}
    }
})

@Injectable()
export class UserState {
    constructor(
        private _globalService: GlobalService,
        private _userService: UserService
    ) { }

    @Selector()
    static users(state: UserStateModel): any[] {
        return state.users;
    }

    @Selector()
    static current(state: UserStateModel): {} {
        return state.current;
    }

    @Selector()
    static pagination(state: UserStateModel): {} {
        return state.pagination;
    }


    @Action(GetUsers, { cancelUncompleted: true })
    getUsers({ patchState, dispatch }: StateContext<UserStateModel>, { params, status }: GetUsers): void {
        this._userService.getAll(params, status).subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    const pagination = Object.assign({}, response);

                    delete pagination.data;
                    delete pagination.status;
                    delete pagination.message;

                    patchState({
                        users: response.data,
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

    @Action(GetUser, { cancelUncompleted: true })
    getUser({ patchState, dispatch }: StateContext<UserStateModel>, { id }: GetUser): void {
        this._userService.getUser(id).subscribe(
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

    @Action(GetUserOnly, { cancelUncompleted: true })
    getUserOnly({ patchState, dispatch }: StateContext<UserStateModel>, { id }: GetUser): void {
        this._userService.getUserOnly(id).subscribe(
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

    @Action(CreateUser, { cancelUncompleted: true })
    createUser({ dispatch }: StateContext<UserStateModel>, { user }: CreateUser): void {
        this._userService.createUser(user).subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    dispatch(new RequestSuccess(response.message, `/users/${response.data.id}/edit`));
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

    @Action(UpdateUser, { cancelUncompleted: true })
    updateUser({ patchState, dispatch }: StateContext<UserStateModel>, { id, user }: UpdateUser): void {
        this._userService.updateUser(id, user).subscribe(
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

    @Action(UpdateUserProfile, { cancelUncompleted: true })
    updateUserProfile({ patchState, dispatch }: StateContext<UserStateModel>, { id, user }: UpdateUserProfile): void {
        this._userService.updateUserProfile(id, user).subscribe(
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

    @Action(DeleteUser, { cancelUncompleted: true })
    deleteUser({ dispatch }: StateContext<UserStateModel>, { id }: DeleteUser): void {
        this._userService.deleteUser(id).subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    dispatch(new RequestSuccess(response.message, '/users'));
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

    @Action(NewUser)
    newUser({ patchState }: StateContext<UserStateModel>): void {
        const newUserDefaults = Object.assign({}, UserDefaults);

        patchState({
            current: newUserDefaults
        });

    }

    @Action(RequestSuccess)
    requestSuccess({ getState, dispatch }: StateContext<UserStateModel>, { message, navigate }: RequestSuccess): void {
        const state = getState();
        if (message) {
            this._globalService.openSnackBar(message);
        }

        if (navigate) {
            dispatch(new Navigate([navigate]));
        }
    }

    @Action(RequestError)
    requestError({ getState, dispatch }: StateContext<UserStateModel>, { message, navigate }: RequestError): void {
        const state = getState();
        if (message) {
            this._globalService.openSnackBar(message);
        }

        if (navigate) {
            dispatch(new Navigate([navigate]));
        }
    }
}

