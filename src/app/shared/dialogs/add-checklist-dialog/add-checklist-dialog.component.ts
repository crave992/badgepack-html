import { Component, Inject, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { tap, takeUntil, take } from 'rxjs/operators';

import { CheckList, CheckListDefaults } from '../../models/checkList.model';
import { GetCheckList, NewCheckList, CreateCheckList, UpdateCheckList } from '../../states/checkList.actions';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { CheckListState } from 'app/shared/states/checkList.state';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckListService } from 'app/shared/services/check-list.service';

import { Editor, Toolbar } from "ngx-editor";

export interface DialogData {
  type?: string;
  confirmText?: string;
  cancelText?: string;
  badgeId?: string;
  id?: string;
  checkListType: string;
  quizzes?: any[];
  activeBadges?: any[];
}

@Component({
  selector: 'app-add-checklist-dialog',
  templateUrl: './add-checklist-dialog.component.html',
  styleUrls: ['./add-checklist-dialog.component.scss'],
  animations: fuseAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddChecklistDialogComponent implements OnInit, OnDestroy {

  confirmText = '';
  cancelText = '';
  badgeId = '';
  checkListType = '';
  id = '';
  type = '';
  oldText = '';

  checkListForm: FormGroup;

  checkList: CheckList[];
  checklist: CheckList;

  checkListSource = new MatTableDataSource([]);

  searchBadges = [];
  searchQuizzes = [];
  quizzes: any[];
  activeBadges: any[];
  titleInitialValue: any;
  body: any;

  descriptionLength: number;

  NewBadgeEditor: Editor;
  SoonToExpireEditor: Editor;
  ExpiredEditor: Editor;
  RemovedbadgeEditor: Editor;
  DescriptionEditor: Editor;
  toolbar: Toolbar = [
    ["bold", "italic"],
    ["ordered_list", "bullet_list"],
    ["blockquote", "link"]
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private _unsubscribeAll: Subject<any>;
  @Select(CheckListState.current) checklist$: Observable<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: DialogData,
    private _dialogRef: MatDialogRef<AddChecklistDialogComponent>,
    private _formBuilder: FormBuilder,
    private _store: Store,
    private _loaderService: NgxUiLoaderService,
    private _checklistService: CheckListService
  ) {
    this.confirmText = _data.confirmText || 'Confirm';
    this.cancelText = _data.cancelText || 'Cancel';
    this.type = _data.type || '';
    this.badgeId = _data.badgeId || '';
    this.id = _data.id || '';
    this.quizzes = _data.quizzes || [];
    this.checkListType = _data.checkListType || 'Ubertickets';
    this.activeBadges = _data.activeBadges || [];
    this.checkListForm = this._formBuilder.group({});
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.NewBadgeEditor = new Editor();
    this.SoonToExpireEditor = new Editor();
    this.ExpiredEditor = new Editor();
    this.RemovedbadgeEditor = new Editor();
    this.DescriptionEditor = new Editor();

    if (this.id) {
      this._store.dispatch(new GetCheckList(this.id));
    } else {
      this._store.dispatch(new NewCheckList());
    }

    if (this.type === 'edit') {
      if (this.checkListType === 'PlayerOne') {
        this._checklistService.getBadgeQuizList(this.badgeId, this.id)
          .subscribe((response) => {
            this.quizzes = response.data;
            this.searchQuizzes = response.data;

            this.quizzes.sort(function (a, b) {
              var quizA = a.name.toUpperCase();
              var quizB = b.name.toUpperCase();
              return (quizA < quizB) ? -1 : (quizA > quizB) ? 1 : 0;
            });

            this.checklist$
              .pipe(
                tap((checklist) => {
                  if (checklist) {
                    this.checkListForm.patchValue(checklist);
                    this.checklist = checklist;
                    this.countDescriptionLength(null, this.checklist.description);
                    this._loaderService.stop();
                  }
                }),
                takeUntil(this._unsubscribeAll)
              )
              .subscribe();
          });
      }

      if (this.checkListType === 'Badge Prerequisite') {
        this._checklistService.badgePrerequisiteList(this.badgeId, this.id)
          .subscribe((response) => {
            this.activeBadges = response.data;
            this.searchBadges = response.data;

            this.checklist$
              .pipe(
                tap((checklist) => {
                  if (checklist) {
                    this.checkListForm.patchValue(checklist);
                    this.checklist = checklist;
                    this.countDescriptionLength(null, this.checklist.description);
                    this._loaderService.stop();
                  }
                }),
                takeUntil(this._unsubscribeAll)
              )
              .subscribe();
          });
      }

    } else {
      this._checklistService.badgePrerequisiteList(this.badgeId, null)
        .subscribe((response) => {
          this.activeBadges = response.data;
          this.searchBadges = response.data;
        });

      this._checklistService.getBadgeQuizList(this.badgeId, null)
        .subscribe((response) => {
          this.quizzes = response.data;
          this.searchQuizzes = response.data;

          this.quizzes.sort(function (a, b) {
            var quizA = a.name.toUpperCase();
            var quizB = b.name.toUpperCase();
            return (quizA < quizB) ? -1 : (quizA > quizB) ? 1 : 0;
          });
        });
    }

    this.checklist$
      .pipe(
        tap((checklist) => {
          if (checklist) {
            this.checkListForm.patchValue(checklist);
            this.checklist = checklist;

            this._loaderService.stop();
          }
        }),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe();

    this.initCheckListForm(this.checkListType);
  }

  initCheckListForm(type, e = null): void {
    this.descriptionLength = 0;
    this.titleInitialValue = e ? (e.source.selected as MatOption).viewValue : '';
    var formFields = {
      badge_id: [this.badgeId],
      type: [type, [Validators.required]],
      title: [this.titleInitialValue, [Validators.required]],
      description: [CheckListDefaults.description],
      settings: [CheckListDefaults.settings],
      meta: this._formBuilder.group({
        allow_user: [CheckListDefaults.meta.allow_user],
      })
    }

    switch (type) {
      case 'Ubertickets':
        this.checkListForm = this._formBuilder.group({
          ...formFields,
          ubt_template_id: [CheckListDefaults.ubt_template_id, [Validators.required]],
          player_one_public_id: [CheckListDefaults.player_one_public_id],
          ubt_template_status: [CheckListDefaults.ubt_template_status, [Validators.required]],
          badge_prerequisite_id: [CheckListDefaults.badge_prerequisite_id],
          hash_id: [CheckListDefaults.hash_id, [Validators.required]]
        });
        break;
      case 'PlayerOne':
        this.checkListForm = this._formBuilder.group({
          ...formFields,
          ubt_template_id: [CheckListDefaults.ubt_template_id],
          player_one_public_id: [e ? e.value : '', [Validators.required]],
          ubt_template_status: [CheckListDefaults.ubt_template_status],
          badge_prerequisite_id: [CheckListDefaults.badge_prerequisite_id],
          hash_id: [CheckListDefaults.hash_id]
        });
        break;
      case 'Badge Prerequisite':
        this.checkListForm = this._formBuilder.group({
          ...formFields,
          ubt_template_id: [CheckListDefaults.ubt_template_id],
          player_one_public_id: [CheckListDefaults.player_one_public_id],
          ubt_template_status: [CheckListDefaults.ubt_template_status],
          badge_prerequisite_id: [e ? e.value : '', [Validators.required]],
          hash_id: [CheckListDefaults.hash_id]
        });
        break;
      case 'Manual':
        this.checkListForm = this._formBuilder.group({
          ...formFields,
          title: [CheckListDefaults.title, [Validators.required]]
        });
        break;
    }
  }

  onSubmit(): void {
    this._dialogRef.close(true);
  }

  setSettings(type): void {
    switch (type) {
      case 'Ubertickets':
        this.checkListForm.controls['settings'].setValue(this.checkListForm.get('ubt_template_id').value + ', '
          + this.checkListForm.get('ubt_template_status').value)
        break;
      case 'PlayerOne':
        if (!this.titleInitialValue) {
          this.titleInitialValue = this.checkListForm.get('title').value;
        }
        this.checkListForm.controls['settings'].setValue(this.titleInitialValue)
        break;
      case 'Badge Prerequisite':
        if (!this.titleInitialValue) {
          this.titleInitialValue = this.checkListForm.get('title').value;
        }
        this.checkListForm.controls['settings'].setValue(this.titleInitialValue)
        break;
    }
  }

  onSave(): void {
    if (this.checkListForm.valid) {
      this.setSettings(this.checkListForm.get('type').value);
      const checkListFormValues = Object.assign({}, this.checkListForm.getRawValue());
      if (this.id) {
        this._store.dispatch(new UpdateCheckList(this.id, checkListFormValues));
      } else {
        this._store.dispatch(new CreateCheckList(checkListFormValues, this.badgeId));
        this.checkListForm.reset();
      }
    }

    this._dialogRef.close(true);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  countDescriptionLength(e: KeyboardEvent, currentDescription = null): void {
    var regex = /(<([^>]+)>)/ig;
    this.body = currentDescription ?
      currentDescription : this.checkListForm.get('description').value;
    var result = this.body.replace(regex, "");
    let charLimit = 499;
    this.descriptionLength = result.length;

    if (!result || result.length <= charLimit || e.key === 'Backspace') {
      return result
    } else {
      e.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent) {
    var regex = /(<([^>]+)>)/ig;

    this.body = this.checkListForm.get('description').value;

    var result = this.body.replace(regex, "");

    let charLimit = 499;

    this.descriptionLength = result.length;

    if (!result || result.length <= charLimit) {
      return result
    } else {
      event.preventDefault();
    }
  }

  public onSearch(value) {
    const filterValue = value.toLowerCase();

    if (this.checkListForm.controls['type'].value === 'Badge Prerequisite') {
      this.searchBadges = this.activeBadges.filter(
        option => option.name.toLowerCase().includes(filterValue)
      );

      if (!value.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')) {
        this.checkListForm.controls['badge_prerequisite_id']
          .setErrors({ 'incorrect_prereq': true });
      }
    }

    if (this.checkListForm.controls['type'].value === 'PlayerOne') {
      this.searchQuizzes = this.quizzes.filter(
        option => option.name.toLowerCase().includes(filterValue)
      );

      var isValid = value ? (this.searchQuizzes.find(quiz => quiz.id === value) ?
        this.searchQuizzes.find(quiz => quiz.id === value).name : null)
        : undefined;

      if (!isValid) {
        this.checkListForm.controls['player_one_public_id']
          .setErrors({ 'incorrect_quiz': true });
      }
    }
  }

  public displayFn(item) {
    var title = '';

    if (this.checkListForm.controls['type'].value === 'Badge Prerequisite') {
      title = item ? (this.searchBadges.find(badge => badge.id === item) ?
        this.searchBadges.find(badge => badge.id === item).name : null)
        : undefined;
    } else {
      title = item ? (this.searchQuizzes.find(quiz => quiz.id === item) ?
        this.searchQuizzes.find(quiz => quiz.id === item).name : null)
        : undefined;
    }

    this.checkListForm.controls['title'].setValue(title);

    return title;
  }
}
