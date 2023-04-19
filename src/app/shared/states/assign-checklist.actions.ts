export class GetAssignCheckLists {
  static readonly type = '[assign-checklist] get assign-checklists';
  constructor(public params: any) { }
}
export class GetAssignCheckList {
  static readonly type = '[assign-checklist] get assign-checklist';
  constructor(public id: string) { }
}
export class NewAssignCheckList {
  static readonly type = '[assign-checklist] new assign-checklist';
}
export class CreateAssignCheckList {
  static readonly type = '[assign-checklist] create assign-checklist';
  constructor(public data: any) { }
}
export class UpdateAssignedCheckList {
  static readonly type = '[assign-checklist] update assign-checklist';
  constructor(public id: string, public userChecklist: any) { }
}
export class RequestSuccess {
  static readonly type = '[badge] request success';
  constructor(public message: string, public navigate: string = '') { }
}
export class RequestError {
  static readonly type = '[assign-checklist] request error';
  constructor(public message: string, public navigate: string = '') { }
}