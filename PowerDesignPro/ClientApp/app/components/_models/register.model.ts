import { BasePickList } from './load.model'

export class RegisterModel {
    UserName: string;
    Email: string;
    Password: string;
    Password2?: string;
    FirstName: string;
    LastName: string;
    CompanyName: string;
    UserCategoryID?: number;
    CustomerNo?: string;
    //BrandID?: number;
    Phone: string;
    Mobile: string;
    Address1: string;
    Address2: string;
    City: string;
    StateID?: number;
    ZipCode: string;
    CountryID?: number;
    NewsLetter: boolean;
    Registered: boolean;
    isTCAccepted: boolean;
    Language: string;
    UserRegisterPickListDto: UserRegisterPickListDto;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class UserRegisterPickListDto {
    CountryList: CountryListDto[];
    StateList: StateListDto[];
    //BrandList: BasePickList[];
    UserCategoryList: BasePickList[];
}

export class StateListDto {
    ID: number;
    Description: string;
    Value: string;
    CountryID: number;
    StateCode: string;
}

export class CountryListDto {
    ID: number;
    Description: string;
    CountryCode: string;
}