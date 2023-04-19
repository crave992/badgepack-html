import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { SharedModule } from 'app/shared/modules/shared.module';

import { ReportBadgesClaimedComponent } from 'app/reports/report-badges-claimed/report-badges-claimed.component';
import { ReportUsersComponent } from './report-users/report-users.component';


const routes: Routes = [
    {
        path     : 'badges',
        component: ReportBadgesClaimedComponent,

    },
    {
        path     : 'users',
        component: ReportUsersComponent,
    }
];

@NgModule({
    declarations: [
        ReportBadgesClaimedComponent,
        ReportUsersComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSidebarModule,
        FuseSharedModule,
        SharedModule
    ]
})
export class ReportsModule
{
}
