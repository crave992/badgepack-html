import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  type: string;
  title: string;
  body: string;
  confirmText: string;
  cancelText: string;
  category: string;
}

@Component({
  selector: 'app-shared-confirmation-dialog',
  templateUrl: './shared-confirmation-dialog.component.html',
  styleUrls: ['./shared-confirmation-dialog.component.scss']
})
export class SharedConfirmationDialogComponent implements OnInit {
  type = '';
  title = '';
  body = '';
  confirmText = '';
  cancelText = '';
  category = '';

  isSave = false;

  constructor(
    private _dialogRef: MatDialogRef<SharedConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: DialogData,
  ) {
    this.type = _data.type || '';
    this.title = _data.title || '';
    this.body = _data.body || '';
    this.confirmText = _data.confirmText || 'Confirm';
    this.cancelText = _data.cancelText || 'Cancel';
    this.category = _data.category || '';
  }

  ngOnInit(): void {

  }

  onSubmit(): void {
    this.isSave = true;
    this._dialogRef.close({'is_save':this.isSave});
  }

}
