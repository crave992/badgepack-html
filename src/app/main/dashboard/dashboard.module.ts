import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { SharedModule } from 'app/shared/modules/shared.module';

import { DashboardComponent } from 'app/main/dashboard/dashboard.component';
import { DashboardTabClaimedComponent } from './dashboard-tab-claimed/dashboard-tab-claimed.component';
import { DashboardTabExpiredComponent } from './dashboard-tab-expired/dashboard-tab-expired.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MatIconModule } from '@angular/material/icon';
import { DashboardTabPartialComponent } from './dashboard-tab-partial/dashboard-tab-partial.component';
import { DashboardTabAvailableComponent } from './dashboard-tab-available/dashboard-tab-available.component';
import { DashboardTabAcquiredComponent } from './dashboard-tab-acquired/dashboard-tab-acquired.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardTabClaimedComponent,
    DashboardTabExpiredComponent,
    DashboardTabPartialComponent,
    DashboardTabAvailableComponent,
    DashboardTabAcquiredComponent
  ],
  imports: [
    RouterModule.forChild(routes),

    FuseSharedModule,
    FuseSidebarModule,
    FuseWidgetModule,
    SharedModule,
    QRCodeModule,
    MatIconModule
  ],
  entryComponents: [
  ]
})
export class DashboardModule {
}

