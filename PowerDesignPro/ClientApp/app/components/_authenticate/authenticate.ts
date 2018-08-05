import { Injectable } from '@angular/core';
import { storeagesevice } from '../Services/storeage.service';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class authenticate implements CanActivate {

    constructor(private router: Router, protected _storage: storeagesevice) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        try {

            if (this._storage.get("pdpAccessToken")) {
                // logged in so return true
                return true;
            }
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
        } catch (e) {
            console.log(e);
            return false;
        } 
       
    }
}