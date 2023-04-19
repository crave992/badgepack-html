import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/modules/shared.module';

import { LoginComponent } from 'app/auth/login/login.component';

const routes = [
    {
        path     : 'login',
        component: LoginComponent
    }
];

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSharedModule,
        SharedModule
    ]
})
export class LoginModule
{
}
