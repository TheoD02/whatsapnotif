export type UserRole = 'admin' | 'operator';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    invited_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface InvitationCode {
    id: number;
    code: string;
    created_by: number;
    used_by: number | null;
    used_at: string | null;
    expires_at: string;
    created_at: string;
    updated_at: string;
}

export type PreferredChannel = 'telegram';

export interface Contact {
    id: number;
    name: string;
    phone: string;
    metadata: Record<string, string>;
    is_active: boolean;
    preferred_channel: PreferredChannel;
    telegram_chat_id: string | null;
    created_at: string;
    updated_at: string;
    groups?: Group[];
}

export interface Group {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    created_at: string;
    updated_at: string;
    contacts_count?: number;
    contacts?: Contact[];
}

export interface MessageTemplate {
    id: number;
    name: string;
    content: string;
    created_by: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    creator?: User;
}

export type NotificationChannel = 'sms' | 'telegram' | 'email';
export type NotificationStatus = 'draft' | 'queued' | 'sending' | 'sent' | 'partial' | 'failed';
export type RecipientStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface Notification {
    id: number;
    title: string | null;
    content: string;
    template_id: number | null;
    channel: NotificationChannel;
    status: NotificationStatus;
    sent_by: number;
    sent_at: string | null;
    created_at: string;
    updated_at: string;
    template?: MessageTemplate;
    sender?: User;
    recipients?: NotificationRecipient[];
    recipients_count?: number;
}

export interface NotificationRecipient {
    id: number;
    notification_id: number;
    contact_id: number;
    status: RecipientStatus;
    error_message: string | null;
    sent_at: string | null;
    created_at: string;
    updated_at: string;
    contact?: Contact;
}

export interface ApiToken {
    id: number;
    name: string;
    token_prefix: string;
    abilities: string[];
    last_used_at: string | null;
    created_by: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    creator?: User;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
