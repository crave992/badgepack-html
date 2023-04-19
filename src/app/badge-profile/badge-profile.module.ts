import { QRCodeModule } from 'angularx-qrcode';
import { LayoutModule } from './../theme/layout/layout.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BadgeProfileComponent } from './badge-profile.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

const routes: Routes = [
     {
        path     : '',
        component: BadgeProfileComponent
     }
];

@NgModule({
  declarations: [
      BadgeProfileComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ScrollingModule,
    MatTooltipModule,
    MatCardModule,
    FlexLayoutModule,
    QRCodeModule
  ]
})
export class BadgeProfileModule { }
