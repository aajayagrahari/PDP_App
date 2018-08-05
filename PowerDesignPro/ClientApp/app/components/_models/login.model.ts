
export class LoginModel{
    UserName: string;
    Password: string;
    accessdenined: boolean;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}


export class LoginModelResponse {
    access_token: string;
    token_type: string;
    expires_in: string;
    refresh_token: string;
    userName: string;
    //brand: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class ConfirmEmailDto {
    UserId: string;
    Code: string;
}

export class ForgotPasswordModel {
    EmailAddress: string;
    Language: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class ResetPasswordModel {
    EmailAddress: string;
    Password: string;
    ConfirmPassword?: string;
    Code: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}