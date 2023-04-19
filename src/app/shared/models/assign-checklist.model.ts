export interface AssignChecklist {
  badge_id?: string | null;
  user_ids?: string | null;
  checklist_ids?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export const AssignChecklistDefaults: AssignChecklist = {
  badge_id: null,
  user_ids: '',
  checklist_ids: ''
};