import { Component, OnInit } from '@angular/core';
import { userService } from '../Services/user.service';
import { LoginModel, LoginModelResponse } from '../_models/login.model';
import { httpclient} from '../Services/httpclient.component';
import { storeagesevice } from '../Services/storeage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { solutionService } from '../Services/solution.services';


@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class loginComponent implements OnInit {
    public loading: boolean = false;
    public token: string;
    public loginresponsemodel: LoginModelResponse;
    public loginmodel = new LoginModel();
    public returnUrl: string;

    constructor(
        private route: ActivatedRoute,
        private _userService: userService,
        protected _storage: storeagesevice,
        protected _route: Router,
        protected _solutionService: solutionService) {
    }

    ngOnInit() {
        // reset login status
        this._userService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    }

    public onLogin(): void {
        this.loading = true;
        let returnObs = this._userService.validateuserlogin(this.loginmodel).subscribe((pdpaccesstkn) => {            
            let castAccessDetails = pdpaccesstkn as LoginModelResponse;
            if (castAccessDetails.access_token != undefined) {
                this._storage.save(this._userService.pdpAccessToken, castAccessDetails.access_token);
                this._storage.save(this._userService.pdpRefreshToken, castAccessDetails.refresh_token);
                this._storage.setUserDetail(this._userService.userName, castAccessDetails.userName);
                //this._storage.save(this._userService.brand, castAccessDetails.brand);
                this._userService.token = this._storage.get(this._userService.pdpAccessToken)
                this._solutionService.CheckUserDefaultSetup().subscribe((result) => {
                    this._storage.save(this._solutionService.userDefaultSetup, result as string);
                    this.loading = false;
                    if (result > 0) {
                        //this._route.navigate(['/home']);
                        this._route.navigateByUrl(this.returnUrl);
                    } else {
                        this._route.navigate(['/userdefaults']);
                    }
                })
            }
            else {
                this.loading = false;
                this.loginmodel.accessdenined = true;
            }
        });
    }

    public HideAlert(): void {
        this.loading = false;
        this.loginmodel.accessdenined = false; 
    }

}
