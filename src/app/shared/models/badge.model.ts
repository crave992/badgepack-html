import { Notification, NotificationDefaults } from './notification.model'

export interface BadgeMeta {
  timezone?: string | null;
  bg_color?: string | null;
  image?: string | null;
  rewards_event_id?: string | null;
  rewards_event_title?: string | null;
  rewards_event_expiry?: string | null;
  rewards_setting?: string | null;
}

export interface BadgeNew {
  subject?: string | null;
  message?: string | null;
}
export interface BadgeSoonToExpire {
  subject?: string | null;
  message?: string | null;
}
export interface BadgeExpired {
  subject?: string | null;
  message?: string | null;
}
export interface BadgeRemoved {
  subject?: string | null;
  message?: string | null;
}

export interface Badge {
  id?: string | null;
  badge_id?: string;
  name: string;
  description?: string;
  recurrence: string;
  recurrence_length: number;
  recurrence_type: string;
  status: string;
  meta?: BadgeMeta;
  new_badge_notifications?: BadgeNew;
  soon_to_expire_notifications?: BadgeSoonToExpire;
  expired_notifications?: BadgeExpired;
  removed_notifications?: BadgeRemoved;
  ubt_toggle_status?: boolean;
  template_id?: string;
  template_status?: string;
  player_one_toggle_status?: boolean;
  public_id?: string;
  coverage: string;
  groups?: [];
  claims?: [];
  external?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  hash?: string;
  labels?: [];
  notifications?: Notification;
}

export interface AssignedBadgeMeta {
  acquired_date: string | null;
  acquired_time: string | null;
}

export interface AssignedBadgeUser {
  username?: string | null;
  code?: string | null;
  name?: string | null;
  meta?: BadgeMeta | null;
}
export interface BadgeDetail {
  name?: string | null;
  meta?: BadgeMeta | null;
}

export interface AssignedBadge {
  id?: string | null;
  badge_id: string | null;
  claim_id: string | null;
  user_ids?: string | null;
  created_user_id: string | null;
  status: string | null;
  enabled_at: Date | null;
  expired_at: string | null;
  application: string | null;
  meta: AssignedBadgeMeta | null;
  remarks: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  user?: AssignedBadgeUser | null;
  badge?: BadgeDetail | null;
  creator?: AssignedBadgeUser | null;
}

export const BadgeDefaults: Badge = {
  id: null,
  badge_id: null,
  name: '',
  description: '',
  notifications: NotificationDefaults,
  recurrence: 'days',
  recurrence_length: 1,
  recurrence_type: 'Expires-after',
  status: 'active',
  meta: {
    timezone: 'Asia/Manila',
    bg_color: 'FFFFFF',
    image: null,
    rewards_event_id: null,
    rewards_event_title: null,
    rewards_event_expiry: null,
    rewards_setting: null
  },
  ubt_toggle_status: false,
  template_id: '',
  template_status: 'new',
  player_one_toggle_status: false,
  public_id: '',
  coverage: 'any',
  groups: [],
  claims: [],
  external: true,
  hash: '',
  labels: [],
};

export const BadgeAssigned: AssignedBadge = {
  id: null,
  badge_id: '',
  claim_id: '',
  user_ids: '',
  application: '',
  created_user_id: '',
  status: 'active',
  enabled_at: new Date(),
  expired_at: '',
  remarks: '',
  meta: {
    acquired_date: '',
    acquired_time: ''
  },
  user: {
    username: '',
    name: '',
    code: '',
    meta: {
      timezone: 'Asia/Manila',
      bg_color: 'FFFFFF',
      image: null,
    }
  },
  badge: {
    name: '',
    meta: {
      timezone: 'Asia/Manila',
      bg_color: 'FFFFFF',
      image: null,
    }
  },  
  creator: {
    username: '',
    name: '',
    code: '',
    meta: {
      timezone: 'Asia/Manila',
      bg_color: 'FFFFFF',
      image: null,
      }
    },
};
