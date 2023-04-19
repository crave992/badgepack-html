import { Params } from '@angular/router';
import { Injectable } from '@angular/core';

import { RequestService } from './request.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class IntegrationService {

    constructor(
        private _requestService: RequestService
    ) { }

    playerOneQuizzes(): Observable<any> {
        return this._requestService.get('integration/playerone/quizzes');
    }

}
