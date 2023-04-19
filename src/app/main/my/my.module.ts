import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { SharedModule } from 'app/shared/modules/shared.module';

import { MyProfileComponent } from 'app/main/my/my-profile/my-profile.component';
import { MyProfileAboutComponent } from './my-profile/my-profile-about/my-profile-about.component';

const routes: Routes = [
    {
        path     : 'profile',
        component: MyProfileComponent
    }
];

@NgModule({
    declarations: [
        MyProfileComponent,
        MyProfileAboutComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSharedModule,
        FuseSidebarModule,
        FuseWidgetModule,
        SharedModule
    ]
})
export class MyModule
{
}

