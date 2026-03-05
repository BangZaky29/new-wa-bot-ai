export interface ConnectionStatus {
    success: boolean;
    status: 'open' | 'connecting' | 'waiting_qr' | 'close' | 'disconnected';
    isConnected: boolean;
    phoneNumber: string | null;
    hasQR: boolean;
    qrImage?: string;
    user?: {
        id: string;
        name: string;
    };
}

export interface Metric {
    label: string;
    value: string | number;
    icon: any;
    color: string;
}

export type TabId = 'control' | 'logs' | 'config' | 'stats' | 'profile' | 'billing';

export interface ChatStats {
    jid: string;
    push_name: string;
    msg_count: number;
    last_active: string;
    last_latency?: number | null;
}

export interface PromptItem {
    id: string;
    name: string;
    content: string;
    is_active: boolean;
}

export interface ContactItem {
    jid: string;
    push_name: string;
    is_allowed: boolean;
}

export interface ApiKeyItem {
    id: string;
    name: string;
    key_value: string;
    model_name: string;
    api_version: string;
    is_active: boolean;
    created_at: string;
}

export interface BlockedAttempt {
    id: string;
    jid: string;
    push_name: string;
    attempted_at: string;
}
