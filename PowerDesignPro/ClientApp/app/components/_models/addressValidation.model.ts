export class AddressValidationRequest {
    Address1: string;
    Address2: string;
    City: string;
    State: string;
    PostalCode: string;
    CountryCode: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export interface IAddressValidationResponse {
    ErrorCode: number
    ErrorDescription: string
    SuggestionList: IAddress[]
    IsValidated: boolean
    IsChangeRequired: boolean// property to check if address request need any change, and then submit again.
    Remarks: string
}

export interface IAddress {
    BusinessName: string
    Address1: string
    Address2: string
    City: string
    State: string
    PostalCode: string
    CountryCode: string
    AddressType: string
}