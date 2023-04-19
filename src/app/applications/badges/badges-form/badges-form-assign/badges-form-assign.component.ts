import { BadgeService } from 'app/shared/services/badge.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserService } from './../../../../shared/services/user.service';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, Input } from '@angular/core';
import {  AssignedBadge, BadgeAssigned} from 'app/shared/models/badge.model';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AssignBadge } from 'app/shared/states/badge.actions';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'badges-form-assign',
  templateUrl: './badges-form-assign.component.html',
  styleUrls: ['./badges-form-assign.component.scss']
})
export class BadgesFormAssignComponent implements OnInit {
    @Input() users;
    assignedBadgesForm: FormGroup;
    time: any;
    pipe = new DatePipe('en-US');
    dateNow = new Date();
    timeNow: any;
  constructor( 
      private _userService: UserService, 
      private _badgeService: BadgeService,
      private _formBuilder: FormBuilder,
      private _store: Store, 
      private _router: ActivatedRoute
      ) { }

  ngOnInit(): void {
      const time = this.dateNow.getHours() + ':' + this.dateNow.getMinutes();
      this.tConvert(time);
      this.initAssignedBadgeForm();
      this.assignedBadgesForm.patchValue({
        meta: {
            'acquired_date': this.dateNow,
            'acquired_time': this.timeNow
        },  
    });
  }

  initAssignedBadgeForm(): void {
    this.assignedBadgesForm = this._formBuilder.group({
        badge_id: [BadgeAssigned.badge_id],
        user_ids: [BadgeAssigned.user_ids, [Validators.required]],
        meta: this._formBuilder.group({
            'acquired_date': [BadgeAssigned.meta.acquired_date, [Validators.required]],
            'acquired_time': [BadgeAssigned.meta.acquired_time, [Validators.required]],
        }),
        remarks: [BadgeAssigned.remarks],
    });
  }  

  tConvert(time): any {
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) { 
      time = time.slice (1);  
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; 
      time[0] = +time[0] % 12 || 12; 
    }
    this.timeNow = time[0] + time[1] + time[2] + ' ' + time[5];
  }

   onSubmit(): void { 
    const acquiredDate = (document.getElementById('getDate') as HTMLInputElement).value;  
    const fixDateFormat = this.pipe.transform(acquiredDate, 'yyyy-MM-dd');
    this.assignedBadgesForm.patchValue({
        badge_id: this._router.snapshot.params.id,
        meta: {
            'acquired_date': fixDateFormat,
        },  
    });
    if (this.assignedBadgesForm.valid) {
           const badgeFormValues = Object.assign({}, this.assignedBadgesForm.value);
           this._store.dispatch(new AssignBadge(badgeFormValues)); 
    
      }  
   }

}
