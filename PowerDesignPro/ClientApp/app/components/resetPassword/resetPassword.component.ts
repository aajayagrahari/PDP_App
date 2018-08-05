import { Component, OnInit } from '@angular/core';
import { userService } from '../Services/user.service';
import { httpclient } from '../Services/httpclient.component';
import { storeagesevice } from '../Services/storeage.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ResetPasswordModel } from '../_models/login.model';


@Component({
    selector: 'resetPassword',
    templateUrl: './resetPassword.component.html',
    styleUrls: ['./resetPassword.component.css']
})

export class ResetPasswordComponent implements OnInit {

    constructor(private _userService: userService, private activatedRoute: ActivatedRoute) {
    }

    public loading: boolean = false;
    public resetPasswordModel = new ResetPasswordModel();
    public error: boolean = false;
    public resetPasswordSuccess: boolean = false;
    public errorMessage: string;
    private code: string;

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.code = params['code'];
        });
    }

    onResetPasswordClick(valid: boolean) {
        if (!valid || !this.code) {
            if (!this.code) {
                this.error = true;
                this.resetPasswordSuccess = false;
            }
            return false;
        }            
        else if (valid && this.code) {
            this.loading = true;
            this.resetPasswordModel.Code = this.code;
            this._userService.ResetPassword(this.resetPasswordModel).subscribe((result) => {
                if (+result.ErrorCode == 0) {
                    this.error = false;
                    this.resetPasswordSuccess = true;
                    this.errorMessage = "";                    
                }
                else {
                    this.error = true;
                    this.resetPasswordSuccess = false;
                    this.errorMessage = result.ErrorDescription;
                }
                this.loading = false;
            });            
        }
    }

    public HideAlert(): void {
        this.error = false;
        this.resetPasswordSuccess = false;
    }
}