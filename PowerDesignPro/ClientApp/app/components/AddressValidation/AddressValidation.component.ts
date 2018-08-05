import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { AddressValidationRequest, IAddressValidationResponse } from '../_models/addressValidation.model';
import { ModalComponent } from '../modal/modal.component';
import { userService } from '../Services/user.service';
import { Response } from '@angular/http';

@Component({
    selector: 'addressValidation',
    templateUrl: './AddressValidation.component.html',
    styleUrls: ['./AddressValidation.component.css']
})
export class AddressValidationComponent implements OnInit {

    @ViewChild('verifiedAddressModal') private verifiedAddressModal: ModalComponent;
    @ViewChild('picklistAddressModal') private picklistAddressModal: ModalComponent;
    @ViewChild('notVerifiedAddressModal') private notVerifiedAddressModal: ModalComponent;

    //@Input() inputAddress: AddressValidationRequest;
    @Output() UpdatedAddress = new EventEmitter<AddressValidationRequest | null>();
    public inputAddress = new AddressValidationRequest();
    public modifiedAddress = new AddressValidationRequest();
    public QASResponse: IAddressValidationResponse;
    public selectedAddressOption: string = "recommended";
    public isVerifiedAddressSelected: boolean;
    public showModal: boolean;
    public loading: boolean = false;

    constructor(private _userService: userService) { }

    ngOnInit() {
        this.isVerifiedAddressSelected = false;
        this.showModal = false;
    }

    public ValidateAddress(inputAddress: AddressValidationRequest): void {
        this.inputAddress = inputAddress;
        this.loading = true;
        this._userService.ValidateAddress(this.inputAddress).subscribe((response) => {
            this.QASResponse = <IAddressValidationResponse>response;
            this.loading = false;
            if (+this.QASResponse.ErrorCode === 0 && this.QASResponse.IsChangeRequired) {
                if (this.QASResponse.IsValidated) {
                    this.showModal = true;
                    this.verifiedAddressModal.show();
                }
                else if (!this.QASResponse.IsValidated) {
                    this.showModal = true;
                    this.picklistAddressModal.show();
                }
            }
            else if (+this.QASResponse.ErrorCode === -1 && !this.QASResponse.IsValidated && !this.QASResponse.IsChangeRequired) {
                this.showModal = true;
                this.notVerifiedAddressModal.show();
            }
            else if ((+this.QASResponse.ErrorCode === 0 && this.QASResponse.IsValidated && !this.QASResponse.IsChangeRequired) || +this.QASResponse.ErrorCode === -2) {
                this.showModal = false;
                this.UpdatedAddress.emit(null);
            }
        });
    }

    public modifyAddress(): void {
        if (this.selectedAddressOption.toLowerCase() === 'recommended') {
            this.modifiedAddress.Address1 = this.QASResponse.SuggestionList[0].Address1;
            this.modifiedAddress.Address2 = this.QASResponse.SuggestionList[0].Address2;
            this.modifiedAddress.City = this.QASResponse.SuggestionList[0].City;
            this.modifiedAddress.State = this.QASResponse.SuggestionList[0].State;
            this.modifiedAddress.PostalCode = this.QASResponse.SuggestionList[0].PostalCode;

            this.isVerifiedAddressSelected = true;
        }
        else {
            this.isVerifiedAddressSelected = false;
        }
        this.showModal = false;
        this.verifiedAddressModal.hide();

        this.isVerifiedAddressSelected ? this.UpdatedAddress.emit(this.modifiedAddress) : this.UpdatedAddress.emit(null);
    }

    public useNotVerifiedAddress(): void {
        this.showModal = false;
        this.notVerifiedAddressModal.hide();
        this.isVerifiedAddressSelected = false;
        this.isVerifiedAddressSelected ? this.UpdatedAddress.emit(this.modifiedAddress) : this.UpdatedAddress.emit(null);
    }

    public useNotVerifiedPicklistAddress(): void {
        this.showModal = false;
        this.picklistAddressModal.hide();
        this.isVerifiedAddressSelected = false;
        this.isVerifiedAddressSelected ? this.UpdatedAddress.emit(this.modifiedAddress) : this.UpdatedAddress.emit(null);
    }

    public updateAddressFromPicklist(suggestedAddress: any) {
        this.modifiedAddress.Address1 = suggestedAddress.BusinessName.toString().trim() === "" ?
            suggestedAddress.Address1 : suggestedAddress.BusinessName + ', ' + suggestedAddress.Address1;
        this.modifiedAddress.Address2 = suggestedAddress.Address2;
        this.modifiedAddress.City = suggestedAddress.City;
        this.modifiedAddress.State = suggestedAddress.State;
        this.modifiedAddress.PostalCode = suggestedAddress.PostalCode;

        this.isVerifiedAddressSelected = true;
        this.showModal = false;
        this.picklistAddressModal.hide();
        this.UpdatedAddress.emit(this.modifiedAddress)
    }

    public getAddressLabelColor(label: string): any {
        if (this.inputAddress !== undefined && this.QASResponse !== undefined) {
            if (label === 'address1' && !(this.inputAddress.Address1 === this.QASResponse.SuggestionList[0].Address1)) {
                return { 'background-color': '#FFFF00' };
            }
            if (label === 'address2' && !(this.inputAddress.Address2 === this.QASResponse.SuggestionList[0].Address2)) {
                return { 'background-color': '#FFFF00' };
            }
            if (label === 'city' && !(this.inputAddress.City === this.QASResponse.SuggestionList[0].City)) {
                return { 'background-color': '#FFFF00' };
            }
            if (label === 'state' && !(this.inputAddress.State === this.QASResponse.SuggestionList[0].State)) {
                return { 'background-color': '#FFFF00' };
            }
            if (label.toLowerCase() === 'zipcode' && !(this.inputAddress.PostalCode === this.QASResponse.SuggestionList[0].PostalCode)) {
                return { 'background-color': '#FFFF00' };
            }
        }
        return {};
    }
}