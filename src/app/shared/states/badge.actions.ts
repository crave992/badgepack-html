export class GetBadges {
  static readonly type = '[badge] get badges';
  constructor(public params: any, public status: any) { }
}
export class GetBadge {
  static readonly type = '[badge] get badge';
  constructor(public id: string) { }
}
export class NewBadge {
  static readonly type = '[badge] new badge';
}
export class CreateBadge {
  static readonly type = '[badge] create badge';
  constructor(public badge: any, public file: any) { }
}
export class AssignBadge {
  static readonly type = '[badge] assign badge';
  constructor(public badge: any) { }
}
export class UpdateAssignedBadge {
  static readonly type = '[badge] update assign badge';
  constructor(public id: string, public assignedBadge: any, public action: string,) { }
}
export class GetUsersBadge {
  static readonly type = '[badge] get users badge';
  constructor(public badge: any) { }
}
export class UpdateBadge {
  static readonly type = '[badge] update badge';
  constructor(public id: string, public badge: any) { }
}
export class DeleteBadge {
  static readonly type = '[badge] delete badge';
  constructor(public id: string) { }
}
export class DeleteAssignedBadge {
  static readonly type = '[badge] delete assigned badge';
  constructor(public id: string, public badgeId: string) { }
}
export class RequestSuccess {
  static readonly type = '[badge] request success';
  constructor(public message: string, public navigate: string = '') { }
}
export class MyBadges {
  static readonly type = '[badge] my badges';
  constructor(public userId: string, public params: any) { }
}
export class RequestError {
  static readonly type = '[badge] request error';
  constructor(public message: string, public navigate: string = '') { }
}