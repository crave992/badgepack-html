import { Component, OnDestroy, OnInit, ViewEncapsulation, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';

import { Store, Select } from '@ngxs/store';
import { NewGroup, GetGroup, CreateGroup, UpdateGroup, DeleteGroup } from 'app/shared/states/group.actions';
import { GroupState } from 'app/shared/states/group.state';
import { Group, GroupDefaults } from 'app/shared/models/group.model';

import { GlobalService } from 'app/shared/services/global.service';

import { MatDialog } from '@angular/material/dialog';

import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';

@Component({
    selector: 'app-groups-form',
    templateUrl: './groups-form.component.html',
    styleUrls: ['./groups-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class GroupsFormComponent implements OnInit, OnDestroy {
    @HostBinding('class') classes = 'center';
    group: Group;
    pageType: string;
    groupForm: FormGroup;

    // @Select(state => state.group.current) group$;
    @Select(GroupState.current) group$: Observable<any>;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _globalService: GlobalService,
        private _store: Store,
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _dialog: MatDialog
    ) {
        this.groupForm = this._formBuilder.group({});

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        this.pageType = 'new';
        this._store.dispatch(new NewGroup());

        this.initGroupForm();
        this._globalService.ngxUiLoader();

        this._activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (params: Params) => {
                    const id = params.id;

                    if (id) {
                        this._store.dispatch(new GetGroup(id));
                    }
                }
            );

        this.group$.subscribe((group) => {
            this.groupForm.patchValue(group);

            if (group.id) {
                this.pageType = 'edit';
            }

            this.group = group;
            this._globalService.ngxUiLoader('stop');
        });
    }

    /**
     * Create group form
     *
     * @returns {FormGroup}
     */
    initGroupForm(): void {
        this.groupForm = this._formBuilder.group({
            id: [GroupDefaults.id],
            code: [GroupDefaults.code, [Validators.required]],
            name: [GroupDefaults.name, [Validators.required]],
            description: [GroupDefaults.description],
            status: [GroupDefaults.status, [Validators.required]],
            meta: this._formBuilder.group({})
        });
    }

    onSubmit(): void {
        if (this.groupForm.valid) {
            this.groupForm.patchValue({
                name: this.groupForm.value.name.trimLeft()
            });

            const groupFormValues = Object.assign({}, this.groupForm.value);
            
            if (this.group.id) {
                this._store.dispatch(new UpdateGroup(this.group.id, groupFormValues));
            } else {
                this._store.dispatch(new CreateGroup(groupFormValues));
            }
        }
    }

    openDialog(action): void {
        let dialogRef;

        let dialogData = {};

        switch (action) {
            case 'delete':
                dialogData = {
                    type: 'warning',
                    title: 'Are you sure?',
                    body: `Deleting this group will permanently remove it from the list.`,
                    confirmText: '',
                    cancelText: ''
                };
                break;
        }

        dialogRef = this._dialog.open(SharedConfirmationDialogComponent, {
            width: '480px',
            data: dialogData
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(result => {
                if (result) {
                    switch (action) {
                        case 'delete':
                            this._store.dispatch(new DeleteGroup(this.group.id));
                            break;
                    }
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }



}
