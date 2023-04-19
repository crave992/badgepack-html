export class DashboardUserAvailableBadges {
  static readonly type = '[dashboard] available';
  constructor(public status: string, public params: any, public data: any) { }
}
export class DashboardUserAcquiredeBadges {
  static readonly type = '[dashboard] acquired';
  constructor(public status: string, public params: any, public data: any) { }
}
export class DashboardClaims {
  static readonly type = '[dashboard] claims';
  constructor(public status: string, public params: any, public data: any) { }
}
export class DashboardPartials {
  static readonly type = '[dashboard] partials';
  constructor(public status: string, public params: any, public data: any) { }
}
export class DashboardExpires {
  static readonly type = '[dashboard] expires';
  constructor(public status: string, public params: any, public data: any) { }
}
export class DashboardBoards {
  static readonly type = '[dashboard] boards';
  constructor(public params: any) { }
}
export class DashboardBadgesBoards {
  static readonly type = '[dashboard] badges boards';
  constructor(public params: any, public labelId: any) { }
}
export class RequestSuccess {
  static readonly type = '[dashboard] request success';
  constructor(public message: string, public navigate: string = '') { }
}
export class RequestError {
  static readonly type = '[dashboard] request error';
  constructor(public message: string, public navigate: string = '') { }
}
