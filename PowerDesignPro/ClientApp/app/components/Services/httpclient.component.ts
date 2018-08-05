import { Component, Injectable, Inject } from '@angular/core';
import { Http, Response, RequestOptions, Headers, URLSearchParams, ResponseContentType, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, NavigationCancel } from '@angular/router';
import { storeagesevice } from '../Services/storeage.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class httpclient {

    public pdpAccessToken: string = "pdpAccessToken";
    public pdpRefreshToken: string = "pdpRefreshToken";
    public userName: string = "userName";
    //public brand: string = "brand";
    public userDefaultSetup = "userDefaultSetup";
    private _url: string;
   private _baseurl: string = "https://wkwebapptest02a.generac.com/";
   // private _baseurl: string = "http://localhost:58013/";
    private self = this;

    private reponseobj: object;
    constructor(
        @Inject('BASE_URL') public originalurl: string,
        private http: Http,
        private _route: Router,
        private _activatedRoute: ActivatedRoute,
        protected _storeagesevice: storeagesevice) {
        this._url = originalurl;
    }

    gethttpdata(restpath: string): Observable<any[]> {
        return this.http.get(this._url + restpath)
            .map(response => {
                return response.json() as any[]
            })
            .catch((err) => {
                return this.handleError(err);
            });
    }

    gethttpdatatoken(restpath: string, token: string): Observable<any[]> {
        let headers = new Headers({ 'Content-Type': 'application/json;' });
        headers.append("Authorization", "bearer " + token);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this._baseurl + restpath, options)
            .map((response: Response) => {
                return response.json()
            })
            .catch((err) => {
                return this.handleError(err);
            });
    }

    deletehttpdatatoken(restpath: string, token: string): Observable<any[]> {
        let headers = new Headers({ 'Content-Type': 'application/json;' });
        headers.append("Authorization", "bearer " + token);
        let options = new RequestOptions({ headers: headers });
        return this.http.delete(this._baseurl + restpath, options)
            .map((response: Response) => {
                return response.json()
            })
            .catch((err) => {
                return this.handleError(err);
            });
    }

    posthttpdatatoken(restpath: string, requestdata: any, token: string): Observable<any[]> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append("Authorization", "bearer " + token);
        let body = JSON.stringify(requestdata);
        return this.http.post(this._baseurl + restpath, body, { headers: headers })
            .map(response => {
                return response.json() as any[]
            })
            .catch((err) => {
                return this.handleError(err);
            });
    }

    posthttpdatatokenforreport(restpath: string, requestdata: any, token: string): Observable<any[]> {
        let headers = new Headers({ 'Content-Type': 'application/Json' });
        headers.append("Authorization", "bearer " + token);
        let body = JSON.stringify(requestdata);
        return this.http.post(this._baseurl + restpath, body, {
            method: RequestMethod.Post,
            responseType: ResponseContentType.Blob,
            headers: headers
        }).map(response => (<Response>response).blob())
            .catch((err) => {
                return this.handleError(err);
            });
    }
    posthttpdata(restpath: string, requestdata: any): Observable<any[]> {
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify(requestdata);
        return this.http.post(this._url + restpath, body, options)
            .map(response => {
                return response.json() as any[]
            })
            .catch((err) => {
                return this.handleError(err);
            });
    }

    logout(): void {
        // remove user from local storage to log user out
        this._storeagesevice.remove(this.pdpAccessToken);
        this._storeagesevice.remove(this.pdpRefreshToken);
        this._storeagesevice.removeUserDetail(this.userName);
        this._storeagesevice.remove(this.userDefaultSetup);
        //this._storeagesevice.remove(this.brand);
        this._route.navigate(['/login']);
    }

    private handleError(error: Response | any) {
        if (error.status == 401) {
            this.logout();
        }
        else {
            console.error('ApiService::handleError', error);
        }
        return Observable.throw(error.json().error);
    }

}