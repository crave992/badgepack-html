export interface CheckList {
  badge_id?: string | null;
  type?: string | null;
  title?: string | null;
  ubt_template_id?: string | null;
  player_one_public_id?: string | null;
  badge_prerequisite_id?: string | null;
  ubt_template_status?: string | null;
  badge?: string | null;
  settings?: string | null;
  hash_id?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  meta?: CheckListMeta;
}

export interface CheckListMeta {
  allow_user?: boolean | null;
}

export const CheckListDefaults: CheckList = {
  badge_id: null,
  type: 'Ubertickets',
  title: '',
  description: '',
  ubt_template_id: '',
  player_one_public_id: '',
  badge_prerequisite_id: '',
  ubt_template_status: '',
  badge: '',
  settings: '',
  hash_id: '',
  meta: {
    allow_user: false,
  }
};

