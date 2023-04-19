export class GetUsers {
    static readonly type = '[user] get users';
    constructor(public params: any, public status: any) {}
}
export class GetUser {
    static readonly type = '[user] get user';
    constructor(public id: string) {}
}
export class GetUserOnly {
    static readonly type = '[user] get user info';
    constructor(public id: string) {}
}

export class NewUser {
    static readonly type = '[user] new user';
}
export class CreateUser {
    static readonly type = '[user] create user';
    constructor(public user: any) {}
}
export class UpdateUser {
    static readonly type = '[user] update user';
    constructor(public id: string, public user: any) {}
}
export class UpdateUserProfile {
    static readonly type = '[user] update user profile';
    constructor(public id: string, public user: any) {}
}
export class DeleteUser {
    static readonly type = '[user] delete user';
    constructor(public id: string) {}
}
export class RequestSuccess {
    static readonly type = '[user] request success';
    constructor(public message: string, public navigate: string = '') {}
}
export class RequestError {
    static readonly type = '[user] request error';
    constructor(public message: string, public navigate: string = '') {}
}
