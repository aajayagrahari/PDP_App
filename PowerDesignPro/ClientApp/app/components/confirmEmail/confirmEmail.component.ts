import { Component, OnInit } from '@angular/core';
import { userService } from '../Services/user.service';
import { httpclient } from '../Services/httpclient.component';
import { storeagesevice } from '../Services/storeage.service';
import { Router, ActivatedRoute, Params } from '@angular/router';


@Component({
    selector: 'confirmEmail',
    templateUrl: './confirmEmail.component.html'
})

export class ConfirmEmailComponent implements OnInit{

    constructor(private _userService: userService, private activatedRoute: ActivatedRoute,) {
    }

    private userId: string;
    private code: string;
    public error: boolean = false;
    public confirmEmailSuccess: boolean = false;

    ngOnInit(): void {

        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.userId = params['userId'];
            this.code = params['code'];

            this._userService.ConfirmRegistrationEmail(this.userId, encodeURIComponent(this.code)).subscribe((result) => {
                if (+result.ErrorCode == 0) {
                    this.error = false;
                    this.confirmEmailSuccess = true;
                }
                else {
                    this.error = true;
                    this.confirmEmailSuccess = false;
                }                    
            });
        });
    }
}