import { UserDefaults } from './../../../../shared/models/user.model';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject, timer, Observable } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { takeUntil, map, startWith } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';

import { GlobalService } from 'app/shared/services/global.service';
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';

import Swal from 'sweetalert2';
import { User } from 'app/shared/models/user.model';
import { Select, Store } from '@ngxs/store';
import { AuthState } from 'app/shared/states/auth.state';
import { UserState } from 'app/shared/states/user.state';
import { GetUser, UpdateUser, UpdateUserProfile} from 'app/shared/states/user.actions';
import { GetGroups } from 'app/shared/states/group.actions';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'my-profile-about',
  templateUrl: './my-profile-about.component.html',
  styleUrls: ['./my-profile-about.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class MyProfileAboutComponent implements OnInit, OnDestroy {

  color: ThemePalette = "accent";
  disabledSlide = false;

  userForm: FormGroup;
  passwordIsValid = true;
  hide = true;
  disabled = true;

  user: User;

  auth;

  private _unsubscribeAll: Subject<any>;

  @Select(AuthState.auth) auth$: Observable<any>;

  @Select(UserState.current) user$: Observable<any>;

  constructor(
    private _formBuilder: FormBuilder,
    private _store: Store,
    private _globalService: GlobalService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._globalService.ngxUiLoader();

    this.auth$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((auth) => {
            if (auth ) {
                this.auth = auth;
            }
        });

    if (this.auth) {
        this._onInitForm();

        this.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
                this.user = user;
                this.userForm.patchValue(user);
                this._globalService.ngxUiLoader('stop');
            });

    }
  }

  private _onInitForm(): void {
    this.userForm = this._formBuilder.group({
      email: [{value: UserDefaults.email, disabled: this.disabled}, [Validators.required, Validators.email]],
      username: [{value: UserDefaults.username, disabled: this.disabled}, [Validators.required]],
      role: [{value: UserDefaults.role, disabled: this.disabled}, [Validators.required]],
      meta: this._formBuilder.group({
        first_name: [UserDefaults.meta.first_name, [Validators.required]],
        last_name: [UserDefaults.meta.last_name, [Validators.required]],
        timezone: [UserDefaults.meta.timezone]
      }),
      new_badge_notification: [UserDefaults.new_badge_notification],
      soon_to_expire_badge_notification: [UserDefaults.soon_to_expire_badge_notification],
      expired_badge_notification: [UserDefaults.expired_badge_notification],
      removed_badge_notification: [UserDefaults.removed_badge_notification],
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userFormValues = Object.assign({}, this.userForm.value);
      this._store.dispatch( new UpdateUserProfile(this.user.id, userFormValues) );
      this._store.dispatch( new GetUser(this.user.id) );
    } else {
      Swal.fire(
        'Form Field Required',
        'Please complete all required fields',
        'warning'
      );
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
