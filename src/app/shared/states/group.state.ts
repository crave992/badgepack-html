import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { GetGroups, GetGroup, NewGroup, CreateGroup, UpdateGroup, DeleteGroup, RequestSuccess, RequestError } from './group.actions';
import { Group, GroupDefaults } from '../models/group.model';

import { GlobalService } from '../services/global.service';
import { GroupService } from '../services/group.service';

export class GroupStateModel {
    groups: Group[];
    current: Group;
    pagination?: {};
}

@State<GroupStateModel>({
    name: 'group',
    defaults: {
        groups: [],
        current: GroupDefaults,
        pagination: {}
    }
})
@Injectable()
export class GroupState {
    constructor(
        private _globalService: GlobalService,
        private _groupService: GroupService
    ) { }

    @Selector()
    static groups(state: GroupStateModel): any[] {
        return state.groups;
    }

    @Selector()
    static current(state: GroupStateModel): {} {
        return state.current;
    }

    @Selector()
    static pagination(state: GroupStateModel): {} {
        return state.pagination;
    }

    @Action(GetGroups, { cancelUncompleted: true })
    getGroups({ patchState, dispatch }: StateContext<GroupStateModel>, { params, status }: GetGroups): void {
        this._groupService.getAll(params, status).subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    const pagination = Object.assign({}, response);

                    delete pagination.data;
                    delete pagination.status;
                    delete pagination.message;

                    patchState({
                        groups: response.data,
                        pagination: pagination
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

    @Action(GetGroup, { cancelUncompleted: true })
    getGroup({ patchState, dispatch }: StateContext<GroupStateModel>, { id }: GetGroup): void {
        this._groupService.getGroup(id).subscribe(
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

    @Action(CreateGroup, { cancelUncompleted: true })
    createGroup({ dispatch }: StateContext<GroupStateModel>, { group }: CreateGroup): void {
        this._groupService.createGroup(group).subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    dispatch(new RequestSuccess(response.message, `/groups/${response.data.id}/edit`));
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

    @Action(UpdateGroup, { cancelUncompleted: true })
    updateGroup({ patchState, dispatch }: StateContext<GroupStateModel>, { id, group }: UpdateGroup): void {
        this._groupService.updateGroup(id, group).subscribe(
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

    @Action(DeleteGroup, { cancelUncompleted: true })
    deleteGroup({ dispatch }: StateContext<GroupStateModel>, { id }: DeleteGroup): void {
        this._groupService.deleteGroup(id).subscribe(
            (response: any) => {
                if (response && response.status === 'success') {
                    dispatch(new RequestSuccess(response.message, '/groups'));
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

    @Action(NewGroup)
    newGroup({ patchState }: StateContext<GroupStateModel>): void {
        const newGroupDefaults = Object.assign({}, GroupDefaults);

        patchState({
            current: newGroupDefaults
        });

    }

    @Action(RequestSuccess)
    requestSuccess({ getState, dispatch }: StateContext<GroupStateModel>, { message, navigate }: RequestSuccess): void {
        const state = getState();
        if (message) {
            this._globalService.openSnackBar(message);
        }

        if (navigate) {
            dispatch(new Navigate([navigate]));
        }
    }

    @Action(RequestError)
    requestError({ getState, dispatch }: StateContext<GroupStateModel>, { message, navigate }: RequestError): void {
        const state = getState();
        if (message) {
            this._globalService.openSnackBar(message);
        }
        
        if (navigate) {
            dispatch(new Navigate([navigate]));
        }
    }
}

