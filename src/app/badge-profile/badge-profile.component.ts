import { Badge } from 'app/shared/models/badge.model';
import { BadgeService } from 'app/shared/services/badge.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/shared/services/user.service';
import { User } from 'app/shared/models/user.model';
import { GlobalService } from 'app/shared/services/global.service';

@Component({
  selector: 'badge-profile',
  templateUrl: './badge-profile.component.html',
  styleUrls: ['./badge-profile.component.scss']
})
export class BadgeProfileComponent implements OnInit {
    login: User;
    badges: Badge;

  constructor(
      private _store: Store,
      private _router: ActivatedRoute,
      private _userService: UserService,
      private _badgeService: BadgeService,
      private _route: Router,
      private _globalService: GlobalService
    ) { }

  ngOnInit(): void {
      this.getUser();
      this.getBadges();
      this.redirect();
  }

  getBadges(): any {
    this._badgeService.getMyBadges(this._router.snapshot.params.id)
      .subscribe((res: any) => {
          if (res) {
            this.badges = res.data;
          }

          this._globalService.ngxUiLoader('stop');
        });
    }

  getUser(): any {
    this._userService.getUser(this._router.snapshot.params.id)
        .subscribe((res: any) => {
            if (res) {
                this.login = res.data;
            }

            this._globalService.ngxUiLoader('stop');
        });
    }

  redirect(): void {
    const token = localStorage.getItem('token');
    if (token === null) {
      this._route.navigate(['./auth/login']);
    }
  }
}
