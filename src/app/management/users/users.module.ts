import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { SharedModule } from 'app/shared/modules/shared.module';

import { UsersComponent } from 'app/management/users/users.component';
import { UsersMainSidebarComponent } from './sidebars/users-main-sidebar/users-main-sidebar.component';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersFormComponent } from './users-form/users-form.component';

const routes: Routes = [
    {
        path     : '',
        component: UsersComponent,
        children : [
            {
                path : '',
                component: UsersListComponent
            },
            {
                path: 'active',
                component: UsersListComponent
            },
            {
                path: 'inactive',
                component: UsersListComponent
            },
            {
                path : 'create',
                component: UsersFormComponent
            },
            {
                path : ':id/edit',
                component: UsersFormComponent
            }
        ]

    }
];

@NgModule({
    declarations: [
        UsersComponent,
        UsersMainSidebarComponent,
        UsersListComponent,
        UsersFormComponent,
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSidebarModule,
        FuseSharedModule,
        SharedModule
    ]
})
export class UsersModule
{
}
