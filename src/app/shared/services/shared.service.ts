import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BadgeService } from './badge.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
 
  private badgeSourcePending = new BehaviorSubject<any>([]);
  private badgeSourceAcquired = new BehaviorSubject<any>([]);

  currentPendingBadges = this.badgeSourcePending.asObservable();
  currentAcquiredBadges= this.badgeSourceAcquired.asObservable();

  constructor() {}

  updateDataPending(badges: any[], checkedItems: any[], countPending:number) {
    var pendingBadgeData = {"badges":badges, "checked_items":checkedItems, "pending_count":countPending};
    this.badgeSourcePending.next(pendingBadgeData);
  }

  updateDataAcquired(badges: any[], countAcquired:number) {
    var acquiredBadgeData = {"badges":badges, "acquired_count":countAcquired};
    this.badgeSourceAcquired.next(acquiredBadgeData);
  }
}
