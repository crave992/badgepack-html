export interface UserMeta {
  first_name: string | null;
  last_name: string | null;
  timezone?: string | null;
  initials?: string | null;
  bg_color?: string | null;
  image?: string | null;
  tag: string | null;
}

export interface User {
  id?: string | null;
  code?: string | null;
  username?: string | null;
  email: string | null;
  name?: string | null;
  role?: string | null;
  merchant?: string | null;
  status?: string | null;
  meta: UserMeta;
  new_badge_notification?: boolean | null,
  soon_to_expire_badge_notification?: boolean | null,
  expired_badge_notification?: boolean | null,
  removed_badge_notification?: boolean | null,
  groups?: [];
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export const UserDefaults: User = {
  id: null,
  code: '',
  username: '',
  email: '',
  name: '',
  role: 'member',
  merchant: 'no',
  status: 'active',
  meta: {
    first_name: '',
    last_name: '',
    timezone: 'Asia/Manila',
    initials: 'NU',
    bg_color: 'FFFFFF',
    image: 'https://via.placeholder.com/96/FFFFFF/303030/?text=NU',
    tag: 'manual'
  },
  new_badge_notification: true,
  soon_to_expire_badge_notification: true,
  expired_badge_notification: true,
  removed_badge_notification: true,

  groups: []
};
