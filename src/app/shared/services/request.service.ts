import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RequestService {
    private _apiEndpoint = environment.apiEndpoint;

    constructor(
        private _httpClient: HttpClient
    ) { }

    get(url = '', _params = []): Observable<any> {
        const params = this.setParams(_params);
        return this._httpClient.get(this._apiEndpoint + url);
    }

    post(url = '', data, params = []): Observable<any> {
        return this._httpClient.post(this._apiEndpoint + url, data);
    }

    postImage(url = '', data, file, params = []): Observable<any> {
        return this._httpClient.post(this._apiEndpoint + url, data, file);
    }

    put(url = '', data, params = []): Observable<any> {
        return this._httpClient.put(this._apiEndpoint + url, data);
    }

    delete(url = '', params = []): Observable<any> {
        return this._httpClient.delete(this._apiEndpoint + url);
    }

    private setParams(data): HttpParams {
        let params = new HttpParams();
    
        for (const p of Object.keys(data)) {
          params = params.append(p, data[p]);
        }
    
        return params;
      }

}
