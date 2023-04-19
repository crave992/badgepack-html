export class GetGroups {
    static readonly type = '[group] get groups';
    constructor(public params: any, public status: any) {}
}
export class GetGroup {
    static readonly type = '[group] get group';
    constructor(public id: string) {}
}
export class NewGroup {
    static readonly type = '[group] new group';
}
export class CreateGroup {
    static readonly type = '[group] create group';
    constructor(public group: any) {}
}
export class UpdateGroup {
    static readonly type = '[group] update group';
    constructor(public id: string, public group: any) {}
}
export class DeleteGroup {
    static readonly type = '[group] delete group';
    constructor(public id: string) {}
}
export class RequestSuccess {
    static readonly type = '[group] request success';
    constructor(public message: string, public navigate: string = '') {}
}
export class RequestError {
    static readonly type = '[group] request error';
    constructor(public message: string, public navigate: string = '') {}
}
