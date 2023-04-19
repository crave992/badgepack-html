export interface GroupMeta {
  initials?: string | null;
  bg_color?: string | null;
  image?: string | null;
}

export interface Group {
  id?: string | null | null;
  code?: string | null;
  name: string | null;
  description?: string | null;
  status: string | null;
  meta?: GroupMeta | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export const GroupDefaults: Group = {
  id: null,
  code: '',
  name: '',
  description: '',
  status: 'active',
  meta: {
    initials: 'NG',
    bg_color: 'FFFFFF',
    image: 'https://via.placeholder.com/96/FFFFFF/303030/?text=NG',
  }
};
