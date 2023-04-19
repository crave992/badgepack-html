export class LoginAuth {
    static readonly type = '[auth] login auth';
    constructor(public auth: any) {}
}
export class LoginSsoAuth {
    static readonly type = '[auth] login sso auth';
    constructor(public auth: any) {}
}
export class LogoutAuth {
    static readonly type = '[auth] logout auth';
}
export class CheckAuth {
    static readonly type = '[auth] check auth';
}
export class SetToken{
    static readonly type = '[auth] set token';
    constructor(public token: string) {}
}
export class SetAuth{
    static readonly type = '[auth] set auth';
    constructor(public auth: any) {}
}
export class RefreshAuth {
    static readonly type = '[auth] refresh auth';
}
export class DeleteAuth{
    static readonly type = '[auth] delete auth';
}
export class RequestSuccess {
    static readonly type = '[auth] request success';
    constructor(public message: string, public navigate: string = '') {}
}
export class RequestError {
    static readonly type = '[auth] request error';
    constructor(public message: string, public navigate: string = '') {}
}
