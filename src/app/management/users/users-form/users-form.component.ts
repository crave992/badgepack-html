import { GetUserOnly } from './../../../shared/states/user.actions';
import { Component, OnDestroy, OnInit, ViewEncapsulation, HostBinding, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';

import { Store, Select } from '@ngxs/store';
import { NewUser, GetUser, CreateUser, UpdateUser, DeleteUser } from 'app/shared/states/user.actions';
import { UserState } from 'app/shared/states/user.state';
import { User, UserDefaults } from 'app/shared/models/user.model';

import { AuthState } from 'app/shared/states/auth.state';
import { GlobalService } from 'app/shared/services/global.service';

import { MatDialog } from '@angular/material/dialog';

import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GroupService } from 'app/shared/services/group.service';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UsersFormComponent implements OnInit, OnDestroy, AfterViewInit {

  @HostBinding('class') classes = 'center';
  user: User;
  pageType: string;
  userForm: FormGroup;

  @ViewChild('groupInput') groupInput: ElementRef<HTMLInputElement>;
  @ViewChild('groupAuto') groupMatAutocomplete: MatAutocomplete;
  groupCtrl = new FormControl();
  filteredGroups: Observable<any[]>;

  userGroups: any[];
  listGroups: any[];
  displayGroups: any[];

  getRoles: any = '';

  @Select(UserState.current) user$: Observable<any>;
  @Select(AuthState.auth) auth$: Observable<any>;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _globalService: GlobalService,
    private _groupService: GroupService,
    private _store: Store,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog
  ) {
    this.userForm = this._formBuilder.group({});
    this.userGroups = [];
    this.listGroups = [];
    this.displayGroups = [];
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {

    this.pageType = 'new';
    this._store.dispatch(new NewUser());

    this.initUserForm();
    this._globalService.ngxUiLoader();

    this._activatedRoute.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (params: Params) => {
          const id = params.id;

          if (id) {
            this._store.dispatch(new GetUserOnly(id));
          }
        }
      );

    this.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        this.userForm.patchValue(user);

        if (user.id) {
          this.pageType = 'edit';
          this.userForm.get('password').setValidators(null);

          this.userForm.patchValue({
            password: '',
            confirm_password: ''
          });

          if (user.groups) {
            this.userGroups = Object.assign([], user.groups);

            this._filterGroups('');
          }
        }

        this.user = user;
        this._globalService.ngxUiLoader('stop');
      });

    this._groupService.getList()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        if (response && response.status === 'success') {
          this.listGroups = response.data;
          this.displayGroups = [];

          this._filterGroups('');
        }
      });

    this.auth$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((role: any) => {
        this.getRoles = role.role;
      });
  }

  initUserForm(): void {
    this.userForm = this._formBuilder.group({
      id: [UserDefaults.id],
      code: [UserDefaults.code, [Validators.required]],
      username: [UserDefaults.username, [Validators.required]],
      email: [UserDefaults.email, [Validators.required, Validators.email]],
      role: [UserDefaults.role, [Validators.required]],
      status: [UserDefaults.status, [Validators.required]],
      password: ['', [Validators.required]],
      confirm_password: [''],
      meta: this._formBuilder.group({
        'first_name': [UserDefaults.meta.first_name, [Validators.required]],
        'last_name': [UserDefaults.meta.last_name, [Validators.required]],
        'timezone': [UserDefaults.meta.timezone, [Validators.required]],
        'tag': [UserDefaults.meta.tag, [Validators.required]]
      }),
      groups: [null, [Validators.required]]
    }, { validators: this._globalService.validationPasswordMatch });
  }

  onSubmit(): void {
    if (this.userForm.controls['password'].touched) {
      this.userForm.controls['confirm_password'].markAllAsTouched();
    }

    if (this.userForm.valid) {
      const userFormValues = Object.assign({}, this.userForm.value);

      userFormValues.groups = this.userGroups.map((group: any) => group.id);

      if (this.user.id) {
        this._store.dispatch(new UpdateUser(this.user.id, userFormValues));
      } else {
        this._store.dispatch(new CreateUser(userFormValues));
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
          body: `Deleting this user will permanently remove it from the list.`,
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
              this._store.dispatch(new DeleteUser(this.user.id));
              break;
          }
        }
      });
  }

  removeGroup(group: any): void {
    const index = this.userGroups.indexOf(group);

    if (index >= 0) {
      this.userGroups.splice(index, 1);

      if (this.userGroups.length < 1) {
        this.userForm.patchValue({ groups: null });
      }

      this._filterGroups('');
    }
  }

  selectedGroup(event: MatAutocompleteSelectedEvent): void {
    this.userGroups.push(event.option.value);

    this.groupInput.nativeElement.value = '';
    this.groupCtrl.setValue('');
    this.userForm.patchValue({ groups: '1' });

    this._filterGroups('');
  }

  private _filterGroups(value: any): any[] {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.displayGroups = this.listGroups.filter((group) => {
        const sGroup = this.userGroups.slice().find((u) => {
          return u.id === group.id;
        });

        const groupCode = group.code.toLowerCase();
        const groupName = group.name.toLowerCase();

        return !sGroup && (groupName.indexOf(filterValue) >= 0 || groupCode.indexOf(filterValue) >= 0);
      });
    }

    return [];
  }

  ngAfterViewInit(): void {
    this.filteredGroups = this.groupCtrl.valueChanges.pipe(
      startWith(''),
      map((group: string | '') => {
        return this._filterGroups(group);
      })
    );

    this.filteredGroups
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((e) => { });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}