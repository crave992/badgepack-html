import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { SharedModule } from 'app/shared/modules/shared.module';

import { GroupsComponent } from 'app/management/groups/groups.component';
import { GroupsMainSidebarComponent } from './sidebars/groups-main-sidebar/groups-main-sidebar.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { GroupsFormComponent } from './groups-form/groups-form.component';

const routes: Routes = [
    {
        path     : '',
        component: GroupsComponent,
        children : [
            {
                path : '',
                component: GroupsListComponent
            },
            {
                path: 'active',
                component: GroupsListComponent
            },
            {
                path: 'inactive',
                component: GroupsListComponent
            },
            {
                path : 'create',
                component: GroupsFormComponent
            },
            {
                path : ':id/edit',
                component: GroupsFormComponent
            }
        ]
        
    }
];

@NgModule({
    declarations: [
        GroupsComponent,
        GroupsMainSidebarComponent,
        GroupsListComponent,
        GroupsFormComponent,
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSidebarModule,
        FuseSharedModule,
        SharedModule
    ]
})
export class GroupsModule
{
}
