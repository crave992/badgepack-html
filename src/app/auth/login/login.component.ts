import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store, Select } from '@ngxs/store';
import { LoginAuth, LoginSsoAuth } from 'app/shared/states/auth.actions';
import { AuthState } from 'app/shared/states/auth.state';

import { SocialAuthService, GoogleLoginProvider } from 'angularx-social-login';

import { GlobalService } from 'app/shared/services/global.service';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _store: Store,
        private _globalService: GlobalService,
        private _socialAuthService: SocialAuthService
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
            remember: [false]
        });

        this._socialAuthService.authState.subscribe((user) => {
            if (user) {
                this._store.dispatch(new LoginSsoAuth({token: user.idToken}));
            }
        });

        this._globalService.ngxUiLoader('stop');
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            const loginFormValues = Object.assign({}, this.loginForm.value);

            this._store.dispatch(new LoginAuth(loginFormValues));
        }
    }

    onGoogleLogin(): void {
        this._socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
    }
}
