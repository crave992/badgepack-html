import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, HostBinding, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

import { takeUntil, filter } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { Store, Select } from '@ngxs/store';
import { DashboardBoards, DashboardClaims, DashboardBadgesBoards } from 'app/shared/states/dashboard.actions';
import { DashboardState } from 'app/shared/states/dashboard.state';
import { BadgeService } from 'app/shared/services/badge.service';

import { environment } from 'environments/environment';

import { MatDialog } from '@angular/material/dialog';

import { AuthState } from 'app/shared/states/auth.state';
import { GlobalService } from 'app/shared/services/global.service';
import { DescriptionDialogComponent } from 'app/shared/dialogs/description-dialog/description-dialog.component';

@Component({
  selector: 'app-boards-list-view',
  templateUrl: './boards-list-view.component.html',
  styleUrls: ['./boards-list-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class BoardsListViewComponent implements OnInit, OnDestroy {

  appEndpoint: string;
  boards: any;

  listUsers = [];
  labels = [];
  filterValue: string;
  listLabels = [];

  user: string;

  auth;

  badges = [];

  actives: any;

  @Select(AuthState.auth) auth$: Observable<any>;

  @Select(DashboardState.boards) boards$: Observable<any>;

  @Output() totalMyBadges = new EventEmitter<number>();

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _badgeService: BadgeService,
    private _store: Store,
    private _dialog: MatDialog,
    private _globalService: GlobalService
  ) {
    this.appEndpoint = environment.appEndpoint;
    this.boards = [];
    this.badges = [];
    this.labels = [];
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._store.dispatch(new DashboardBoards({ page: 1 }));
    this._globalService.ngxUiLoader();

    this.getBadges();
    this.getLabels();

    this.auth$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((auth) => {
        this.auth = auth;
      });
  }

  getBadges(): void {
    this.boards$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((boards) => {
        this.boards = boards;
        this.badges = boards;

        if (this.boards) {
          for (const label of this.boards) {
            this.labels.push(label.name);
          }
          this.totalMyBadges.emit(this.boards.length || 0);
          this._globalService.ngxUiLoader('stop');
        }
      });
  }

  getLabels(): any {
    this._badgeService.getLabels()
      .subscribe((res: any) => {
        this.listLabels = res.data;
      });
  }

  onSelectLabel(event): void {
    if (event.value === 'all') {
      this._store.dispatch(new DashboardBoards({ page: 1 }));
      this.getBadges();
    }
    else {
      this._store.dispatch(new DashboardBadgesBoards({ page: 1 }, event.value));
      this.getBadges();
    }
  }

  onSearchFilter(event: Event): void {
    let filterValue = (event.target as HTMLInputElement).value;

    if (filterValue === '') {
      this.getBadges();
    } else if (filterValue.includes(', ')) {
      const filters = filterValue.split(', ');
      this.boards = this.badges.filter((badges) => {
        let badgeValid = false;
        for (let filter of filters) {
          filter = filter.replace(',', '');
          const emptyString = '';
          filter = filter.trimLeft();
          if (filter !== emptyString.trimLeft()) {
            if (badges.name.toLowerCase().includes(filter.toLowerCase())) {
              badgeValid = true;
              break;
            }
            else {
              for (const label of badges.labels) {
                if (label.name.toLowerCase().includes(filter.toLowerCase())) {
                  badgeValid = true;
                  break;
                }
              }
            }
          }
        }
        return badgeValid;
      });
    } else {
      filterValue = filterValue.replace(',', '');
      this.boards = this.badges.filter((badges) => {
        let valid = false;
        for (const label of badges.labels) {
          if (label.name.toLowerCase().includes(filterValue.toLowerCase())) {
            valid = true;
            break;
          }
        }
        return badges.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          valid;
      });
    }
  }

  truncateChar(text: string): string {
    let charlimit = 300;
    if (!text || text.length <= charlimit) {
      return text;
    }

    let shortened = text.substring(0, charlimit) + "...";
    return shortened;
  }

  onOpenDialog(description, checklists = null): void {
    let dialogRef;

    let dialogData = {
      description,
      checklists,
      confirmText: '',
      cancelText: ''
    };

    dialogRef = this._dialog.open(DescriptionDialogComponent, {
      width: '1200px',
      data: dialogData
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
