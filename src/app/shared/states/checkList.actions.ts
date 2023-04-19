export class GetCheckLists {
  static readonly type = '[checklist] get checklists';
  constructor(public params: any) { }
}
export class GetCheckList {
  static readonly type = '[checklist] get checklist';
  constructor(public id: string) { }
}
export class GetBadgeQuizList {
  static readonly type = '[quiz] get quizlist';
  constructor(public id: string, public checklistId: string) { }
}
export class NewCheckList {
  static readonly type = '[checklist] new checklist';
}
export class CreateCheckList {
  static readonly type = '[checklist] create checklist';
  constructor(public checklist: any, public checklistId: string) { }
}
export class UpdateCheckList {
  static readonly type = '[checklist] update checklist';
  constructor(public id: string, public checklist: any) { }
}
export class RequestSuccess {
  static readonly type = '[badge] request success';
  constructor(public message: string, public navigate: string = '') { }
}
export class RequestError {
  static readonly type = '[checklist] request error';
  constructor(public message: string, public navigate: string = '') { }
}
export class DeleteCheckList {
  static readonly type = '[checklist] delete checklist';
  constructor(public id: string) { }
}

