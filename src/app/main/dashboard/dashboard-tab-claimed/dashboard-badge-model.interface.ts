export interface DashboardBadge {
    id?: string;
    name?: string;
    description?: string;
    notificaton?: string;
    recurrence?: string;
    recurrence_length?: string; 
    recurrence_type?: string;
    coverage?: string; 
    status: string;
    created_at?: string;	
    updated_at?: string;
    deleted_at?: string;
    ubt_toggle_status?: string;
    template_id?: number;
    template_status ?: string;
}