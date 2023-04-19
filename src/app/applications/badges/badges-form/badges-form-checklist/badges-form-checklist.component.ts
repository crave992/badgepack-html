import { Component, Input, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';
import { Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { AddChecklistDialogComponent } from 'app/shared/dialogs/add-checklist-dialog/add-checklist-dialog.component';
import { CheckListService } from 'app/shared/services/check-list.service';
import { CheckList } from 'app/shared/models/checkList.model';
import { CheckListState } from 'app/shared/states/checkList.state';
import { DeleteCheckList, GetCheckList, GetCheckLists } from 'app/shared/states/checkList.actions';
import { IntegrationService } from 'app/shared/services/integration.service';
import { BadgeService } from 'app/shared/services/badge.service';
import { AuthState } from 'app/shared/states/auth.state';

@Component({
  selector: 'badges-form-checklist',
  templateUrl: './badges-form-checklist.component.html',
  styleUrls: ['./badges-form-checklist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgesFormChecklistComponent implements OnInit {

  checkListType: string;
  width: string;
  encode_email: string;

  quizzes: any[];
  current_badge_quizzes: any[];
  current_badge_prereq: any [];
  activeBadges: any[];
  dialogComponent: any;
  checkList: CheckList[];

  auth;

  displayedColumns = ['title', 'description', 'type', 'settings', 'actions'];

  checkListSource = new MatTableDataSource([]);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Select(CheckListState.checklist) checkList$: Observable<any>;
  @Select(AuthState.auth) auth$: Observable<any>;

  private _unsubscribeAll: Subject<any>;

  @Input() badgeId;
  @Input() checklist;

  constructor(
    private _dialog: MatDialog,
    private _router: ActivatedRoute,
    private _store: Store,
    private _checkListService: CheckListService,
    private _integrationService: IntegrationService,
    private _badgeService: BadgeService,
    private _checklistService: CheckListService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._store.dispatch(new GetCheckLists(this.badgeId)).pipe(takeUntil(this._unsubscribeAll));

    this.auth$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((auth) => {
        this.auth = auth;
        this.encode_email = btoa(auth.email);
    });

    this.checkList$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((checkList) => {
        this.checkList = checkList;
        this.checkListSource = new MatTableDataSource(checkList);
        this.checkListSource.paginator = this.paginator;
        this.checkListSource.sort = this.sort;
      });

    this._checkListService.getBadgeQuizList(this.badgeId, null)
      .subscribe((response) => {
        this.quizzes = response.data;
        this.current_badge_quizzes = response.unset_quizzes;
      });

    this._checklistService.badgePrerequisiteList(this.badgeId, null)
      .subscribe((response) => {
        this.activeBadges = response.data;
        this.current_badge_prereq = response.unset_badges;
      });

  }
  onOpenDialogDelete(action, id, checkListType = null, title = null): void {
    let dialogRef;
    let dialogData = {};
    switch (action) {
      case 'delete':
        dialogData = {
          type: 'warning',
          title: 'Are you sure?',
          body: `Are you sure you want to remove ` + title + '?',
          confirmText: 'Yes',
          cancelText: 'No'
        };
        this.width = '480px';
        this.dialogComponent = SharedConfirmationDialogComponent;
        break;
      case 'add':
        dialogData = {
          type: '',
          title: '',
          body: ``,
          id: '',
          quizzes: this.quizzes,
          activeBadges: this.activeBadges,
          badgeId: this.badgeId,
          confirmText: 'Create',
          cancelText: 'Cancel'
        };
        this.width = '600px';
        this.dialogComponent = AddChecklistDialogComponent;
        break;
      case 'edit':
        dialogData = {
          type: 'edit',
          title: '',
          body: ``,
          checkListType,
          id: id,
          quizzes: this.quizzes,
          activeBadges: this.activeBadges,
          badgeId: this.badgeId,
          confirmText: 'Update',
          cancelText: 'Cancel'
        };
        this.width = '600px';
        this.dialogComponent = AddChecklistDialogComponent;
        break;
    }

    dialogRef = this._dialog.open(this.dialogComponent, {
      width: this.width,
      data: dialogData
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result) => {
        if (result) {
          switch (action) {
            case 'delete':
              if (this._router.snapshot.params.id) {
                this._store.dispatch(new DeleteCheckList(id));
                setTimeout(() => {
                  this.getUpdatedTable();
                }, 100);
              }
              break;
            default:
              this.getUpdatedTable();
          }
        }
      });
  }

  getUpdatedTable(): void {
    this._checkListService.listChecklist(this.badgeId)
      .subscribe((checklist: any) => {
        this.checkList = checklist;

        this.checkListSource = new MatTableDataSource(checklist.data);

        this.checkListSource.paginator = this.paginator;
        this.checkListSource.sort = this.sort;
      });
  }

}
