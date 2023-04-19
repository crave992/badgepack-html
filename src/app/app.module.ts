import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { TranslateModule } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';

import { fuseConfig } from 'app/theme/fuse-config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/theme/layout/layout.module';
import { SharedModule } from 'app/shared/modules/shared.module';

import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

import { AuthState } from 'app/shared/states/auth.state';
import { UserState } from 'app/shared/states/user.state';
import { GroupState } from 'app/shared/states/group.state';
import { BadgeState } from 'app/shared/states/badge.state';
import { DashboardState } from 'app/shared/states/dashboard.state';
import { CheckListState } from 'app/shared/states/checkList.state';

import { AuthInterceptor } from 'app/shared/interceptors/auth.interceptor';
import { AuthResolver } from 'app/shared/resolvers/auth.resolver';
import { AuthGuard } from 'app/shared/guards/auth.guard';
import { AuthAdminGuard } from 'app/shared/guards/auth-admin.guard';
import { AuthManageGuard } from 'app/shared/guards/auth-manage.guard';

import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from 'angularx-social-login';

import { environment } from 'environments/environment';
import { NgxMaterialTimepickerDialComponent, NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AddChecklistDialogComponent } from './shared/dialogs/add-checklist-dialog/add-checklist-dialog.component';
import { IssueBadgeChecklistComponent } from './shared/dialogs/issue-badge-checklist/issue-badge-checklist.component';
import { ChecklistDialogComponent } from './shared/dialogs/checklist-dialog/checklist-dialog.component';
import { MaterialModule } from './shared/modules/material.module';
import { AssignCheckListState } from './shared/states/assign-checklist.state.';
import { ProgressChecklistDialogComponent } from './shared/dialogs/progress-checklist-dialog/progress-checklist-dialog.component';
import { DescriptionDialogComponent } from './shared/dialogs/description-dialog/description-dialog.component';

const appRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '_',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./main/dashboard/dashboard.module').then(m => m.DashboardModule),
    resolve: { authResolver: AuthResolver },
    canActivate: [AuthGuard]
  },
  {
    path: 'boards',
    loadChildren: () => import('./main/boards/boards.module').then(m => m.BoardsModule),
    resolve: { authResolver: AuthResolver },
    canActivate: [AuthGuard, AuthManageGuard]
  },
  {
    path: 'my',
    loadChildren: () => import('./main/my/my.module').then(m => m.MyModule),
    resolve: { authResolver: AuthResolver },
    canActivate: [AuthGuard]
  },
  {
    path: 'badges',
    loadChildren: () => import('./applications/badges/badges.module').then(m => m.BadgesModule),
    resolve: { authResolver: AuthResolver },
    canActivate: [AuthGuard, AuthManageGuard]
  },
  {
    path: 'badge',
    loadChildren: () => import('./applications/badges/badge-board/badge-board.module').then(m => m.BadgeBoardModule),
    resolve: { authResolver: AuthResolver },
    canActivate: [AuthGuard, AuthManageGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./management/users/users.module').then(m => m.UsersModule),
    resolve: { authResolver: AuthResolver },
    canActivate: [AuthGuard, AuthManageGuard]
  },
  {
    path: 'groups',
    loadChildren: () => import('./management/groups/groups.module').then(m => m.GroupsModule),
    resolve: { authResolver: AuthResolver },
    canActivate: [AuthGuard, AuthAdminGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),
    resolve: { authResolver: AuthResolver },
    canActivate: [AuthGuard, AuthManageGuard]
  },
  {
    path: ':id/badge-profile',
    loadChildren: () => import('./badge-profile/badge-profile.module').then(m => m.BadgeProfileModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    AddChecklistDialogComponent,
    IssueBadgeChecklistComponent,
    ChecklistDialogComponent,
    ProgressChecklistDialogComponent,
    DescriptionDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    RouterModule.forRoot(appRoutes),

    TranslateModule.forRoot(),

    // Material moment date module
    MatMomentDateModule,

    // Fuse modules
    FuseModule.forRoot(fuseConfig),
    FuseProgressBarModule,
    FuseSharedModule,
    FuseSidebarModule,
    FuseThemeOptionsModule,

    // App modules
    LayoutModule,
    NgxsModule.forRoot([
      AuthState,
      UserState,
      GroupState,
      BadgeState,
      DashboardState,
      CheckListState,
      AssignCheckListState
    ], {
      developmentMode: !environment.production
    }),
    NgxsRouterPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production,
    }),
    SharedModule,
    SocialLoginModule,
    NgxMaterialTimepickerModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.googleClientId
            ),
          }
        ],
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
