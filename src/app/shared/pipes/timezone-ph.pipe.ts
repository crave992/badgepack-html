import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';
import { Store, Select } from '@ngxs/store';
import { AuthState } from '../states/auth.state';

@Pipe({
    name: 'tzPhDate'
})
export class TimezonePhDatePipe implements PipeTransform {
    timezone = 'Asia/Manila';

    constructor(
        private _store: Store,
    ) { }

    transform(value: '', ...args: string[]): string {
        const auth = this._store.selectSnapshot(AuthState.auth);

        const [format, zone] = args;

        if (!this._isDateValid(value)) {
            return value;
        }
        
        let tz = moment(value).tz(this.timezone);
        let timezone = this.timezone;

        const userTimezone = auth.meta.timezone;

        if (userTimezone) {
            timezone = userTimezone;
        }

        if (zone && zone === 'none') {
            tz = moment(value);
        } else {
            tz = moment(tz).tz(timezone);
        }

        if (format === 'ago') {
            return tz.fromNow();
        }

        return tz.format(format);
    }

    private _isDateValid(date): boolean {
        return moment(new Date(date)).isValid();
    }
}
