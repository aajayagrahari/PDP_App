import { Component, OnInit } from '@angular/core';
import { userService } from '../Services/user.service';
import { httpclient } from '../Services/httpclient.component';
import { storeagesevice } from '../Services/storeage.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ForgotPasswordModel } from '../_models/login.model';
import { UtilityService } from '../Services/utility.service';


@Component({
    selector: 'forgotPassword',
    templateUrl: './forgotPassword.component.html',
    styleUrls: ['./forgotPassword.component.css']
})

export class ForgotPasswordComponent implements OnInit {

    constructor(private _userService: userService, private activatedRoute: ActivatedRoute, private _utilityService: UtilityService) {
    }

    public loading: boolean = false;
    public forgotPasswordModel = new ForgotPasswordModel();
    public error: boolean = false;
    public forgotPasswordSuccess: boolean = false;
    public errorMessage: string;

    ngOnInit(): void { 
        if (typeof window != undefined) {
            const _satellite = (window as any)._satellite;
            if (_satellite) {
                _satellite.track("DCForgotPassword");
            }
        }
    }

    onForgotPasswordClick(valid: boolean) {
        if (!valid)
            return false;
        else {
            this.loading = true;
            this.forgotPasswordModel.Language = this._utilityService.userBrowserLocale;
            this._userService.ForgotPassword(this.forgotPasswordModel).subscribe((result) => {
                if (+result.ErrorCode == 0) {
                    this.error = false;
                    this.forgotPasswordSuccess = true;
                    this.errorMessage = "";
                }
                else {
                    debugger
                    this.error = true;
                    this.forgotPasswordSuccess = false;
                    this.errorMessage = result.ErrorDescription;
                }
                this.loading = false;
            });
        }
    }

    public HideAlert(): void {
        this.error = false;
        this.forgotPasswordSuccess = false;
    }
}