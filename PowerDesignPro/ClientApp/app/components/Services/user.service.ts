import { Component, Injectable, Inject } from '@angular/core';
import { LoginModel, LoginModelResponse, ForgotPasswordModel, ResetPasswordModel } from '../_models/login.model'
import { Observable } from 'rxjs/Observable';
import { httpclient } from '../Services/httpclient.component';
import { storeagesevice } from '../Services/storeage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressValidationRequest } from '../_models/addressValidation.model';

@Injectable()

export class userService {
    public token: string;

    public pdpAccessToken: string = this._httpclient.pdpAccessToken;
    public pdpRefreshToken: string = this._httpclient.pdpRefreshToken;
    public userName: string = this._httpclient.userName;
    //public brand: string = this._httpclient.brand;

    constructor(protected _httpclient: httpclient, protected _storeagesevice: storeagesevice, protected _route: Router) {
        // set token if saved in local storage
        try {
            var currentUser = this._storeagesevice.get(this.pdpAccessToken);
            this.token = currentUser;
        } catch (e) {
            this.token = "";
        }
       
    }
    validateuserlogin<T>(req: LoginModel): Observable<any>   {
        return this._httpclient.posthttpdata("home/OnCustomerLogin", req).map((pdpaccess) => {
            return pdpaccess;
        });
    }
    
    logout(): void {
        this._httpclient.logout();
    }

    //User Registration
 
     UserRegistration<T>(register: T): Observable<any> {
        return this._httpclient.posthttpdatatoken("Account/Register", register, "").map((result) => {
            return result;
        });
    }

     AccountUpdate<T>(register: T): Observable<any> {
         return this._httpclient.posthttpdatatoken("Account/AccountUpdate", register, this.token).map((result) => {
             return result;
         });
     }

    GetUserRegistration():Observable<any> {
        return this._httpclient.gethttpdatatoken("Account/GetUserRegister", "").map((result) => {
            return result;
        });
     }

    GetUserDetails(): Observable<any> {
        return this._httpclient.gethttpdatatoken("Account/GetUserDetails", this.token).map((result) => {
            return result;
        });
    }

    ConfirmRegistrationEmail(userId: string, code: string): Observable<any> {
        return this._httpclient.gethttpdatatoken("Account/ConfirmRegistrationEmail?userId=" + userId + "&code=" + code, "").map((result) => {
            return result;
        });
    }

    ForgotPassword(forgotPasswordModel: ForgotPasswordModel): Observable<any> {
        return this._httpclient.posthttpdatatoken("Account/ForgotPassword", forgotPasswordModel, "").map((result) => {
            return result;
        });
    }

    ResetPassword(resetPasswordModel: ResetPasswordModel): Observable<any> {
        return this._httpclient.posthttpdatatoken("Account/ResetPassword", resetPasswordModel, "").map((result) => {
            return result;
        });
    }

    ValidateAddress(inputAddress: AddressValidationRequest): Observable<any> {
        return this._httpclient.posthttpdatatoken("AddressValidation/Validate", inputAddress, "").map((result) => {
            return result;
        });
    }
}