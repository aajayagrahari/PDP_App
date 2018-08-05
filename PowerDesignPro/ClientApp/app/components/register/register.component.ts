import { Component, OnInit, ViewChild } from '@angular/core';
import { NgModel, NgForm, PatternValidator } from '@angular/forms';
import { RegisterModel } from '../_models/register.model';
import { userService } from '../Services/user.service';
import { httpclient } from '../Services/httpclient.component';
import { Router, ActivatedRoute } from "@angular/router";
import { AddressValidationRequest } from '../_models/addressValidation.model';
import { AddressValidationComponent } from '../AddressValidation/AddressValidation.component';
import { UtilityService } from '../Services/utility.service';

@Component({
    selector: 'register',
    providers: [userService],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class registerComponent implements OnInit {
    public loading: boolean = false;
    public error: boolean = false;
    public registerSuccess: boolean = false;
    public UserRegisterDto: RegisterModel;
    public UserRegisterDefaultDto = new RegisterModel();
    public showError: boolean = false;
    public invalidUserCategory = false;
    public errorMessage: string;
    public inputAddress = new AddressValidationRequest();
    public isAddressVerified: boolean = false;
    @ViewChild('addressValidation') addressValidation: AddressValidationComponent;

    constructor(private _userService: userService, protected _route: Router, private activatedRoute: ActivatedRoute,
        private _utilityService: UtilityService) {
    }
    
    ngOnInit(): void {
        this.loading = true;
        this._userService.GetUserRegistration().subscribe((model) => {
            this.UserRegisterDto = model as RegisterModel;
            this.UserRegisterDto.CountryID = undefined;
            this.UserRegisterDto.StateID = undefined;
            //this.UserRegisterDto.BrandID = undefined;
            this.UserRegisterDto.UserCategoryID = undefined;
            this.UserRegisterDto.Password2 = undefined;
            this.UserRegisterDefaultDto = JSON.parse(JSON.stringify(this.UserRegisterDto));
            this.MapState(this.UserRegisterDto.CountryID);
            this.loading = false;
        });
        if (typeof window != undefined) {
            const _satellite = (window as any)._satellite;
            if (_satellite) {
                _satellite.track("DCRegistration");
            }
        }
    }

    hasError(event: any): void {
        alert('invalid data');
    }

    validateUserCategory(model: any): void {
        if (this.UserRegisterDto.UserCategoryID != model) {
            this.UserRegisterDto.UserCategoryID = model;
            this.invalidUserCategory = false;
        }
    }

    UserRegistration(isValid: boolean): void {
        var stateCode = '';
        var countryCode = '';

        this.errorMessage = "";
        if (!isValid) {
            if (this.UserRegisterDto.UserCategoryID == undefined) {
                this.invalidUserCategory = true;
            }
            return;
        }

        var state = this.UserRegisterDto.UserRegisterPickListDto.StateList.find(s => s.ID == this.UserRegisterDto.StateID);
        if (state != undefined)
            stateCode = state.StateCode;

        var country = this.UserRegisterDto.UserRegisterPickListDto.CountryList.find(c => c.ID == this.UserRegisterDto.CountryID);
        if (country != undefined)
            countryCode = country.CountryCode;

        this.inputAddress = {
            Address1: this.UserRegisterDto.Address1,
            Address2: this.UserRegisterDto.Address2,
            City: this.UserRegisterDto.City,
            State: stateCode,
            PostalCode: this.UserRegisterDto.ZipCode,
            CountryCode: countryCode
        };

        if (!this.isAddressVerified && (this.inputAddress.CountryCode == 'US' || this.inputAddress.CountryCode == 'CA')) {
            this.addressValidation.ValidateAddress(this.inputAddress);
        }
        else {
            this.isAddressVerified = true;
            this.postRegistrationData();
        }
    }


    MapState(countryId: number | undefined): void {
        if (countryId == undefined) {
            this.UserRegisterDto.UserRegisterPickListDto.StateList = [];
        }
        else {
            this.UserRegisterDto.UserRegisterPickListDto.StateList = this.UserRegisterDefaultDto.UserRegisterPickListDto.StateList.filter(x => x.CountryID == countryId);
        }        
    }

    /**
     * Emitted event from AddressValidation child component
     * @param modifiedAddress
     */
    UpdatedAddress(modifiedAddress: AddressValidationRequest | null): void {
        this.loading = true;
        if (modifiedAddress) {
            this.UserRegisterDto.Address1 = modifiedAddress.Address1
            this.UserRegisterDto.Address2 = modifiedAddress.Address2
            this.UserRegisterDto.City = modifiedAddress.City

            var state = this.UserRegisterDto.UserRegisterPickListDto.StateList.find(s => s.StateCode.toLowerCase() == modifiedAddress.State.toLowerCase());
            if (state != undefined)
                this.UserRegisterDto.StateID = state.ID;

            this.UserRegisterDto.ZipCode = modifiedAddress.PostalCode
        }
        this.isAddressVerified = true;

        this.postRegistrationData();
    }

    postRegistrationData(): void {
        this.UserRegisterDto.UserName = this.UserRegisterDto.Email;
        this.UserRegisterDto.Language = this._utilityService.userBrowserLocale;
        this._userService.UserRegistration(this.UserRegisterDto).subscribe((addedUser) => {
            if (addedUser.ErrorCode != undefined && addedUser.ErrorCode != 0) {
                this.errorMessage = addedUser.ErrorDescription;
                this.error = true;
                this.registerSuccess = false;
            }
            else {
                this.UserRegisterDto.Registered = true;
                this.error = false;
                this.registerSuccess = true;

                try {
                    var analyticsEvent = document.createEvent('CustomEvent');
                    analyticsEvent.initCustomEvent('Successful_Registration', true, true, {});
                    var element = document.getElementById('submitRegistration');
                    if (!!element) {
                        element.dispatchEvent(analyticsEvent);
                    }
                }
                catch (e) {
                }
            }
            this.loading = false;
        });
    }
}