import { AssignedBadge } from './../../../shared/models/badge.model';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngxs/store';
import { Badge } from 'app/shared/models/badge.model';
import { User } from 'app/shared/models/user.model';
import { BadgeService } from 'app/shared/services/badge.service';
import { GlobalService } from 'app/shared/services/global.service';
import { UserService } from 'app/shared/services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseConfigService } from '@fuse/services/config.service';

@Component({
  selector: 'badges-detail',
  templateUrl: './badges-detail.component.html',
  styleUrls: ['./badges-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class BadgesDetailComponent implements OnInit {
    login: User;
    badge: AssignedBadge;

    private _unsubscribeAll: Subject<any>;

  constructor(
    private _fuseConfigService: FuseConfigService,
      private _store: Store,
      private _router: ActivatedRoute,
      private _userService: UserService,
      private _badgeService: BadgeService,
      private _route: Router,
      private _globalService: GlobalService,
    ) { 
        this._unsubscribeAll = new Subject();

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

  ngOnInit(): void {
    this._router.params
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
        (params: Params) => {
            const id = params.id;

            if (id) {
                this.getBadgeClaim(id);
            }
        }
    );
  }

  getBadgeClaim(id): any {  
    this._badgeService.getBadgeClaim(id)
      .subscribe((res: any) => { 
          if (res) {
            this.badge = res.data;
          }

          this._globalService.ngxUiLoader('stop'); 
        });    
    }

}
