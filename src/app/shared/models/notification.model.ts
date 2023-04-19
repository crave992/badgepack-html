
export interface Notification {
  id?: string | null;
  subject?: string;
  message?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export const NotificationDefaults: Notification = {
    id: null,
    subject: '',
    message: '',
    type: ''
};