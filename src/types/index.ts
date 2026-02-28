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

export type TabId = 'control' | 'logs' | 'config' | 'stats';

export interface ChatStats {
    jid: string;
    push_name: string;
    msg_count: number;
    last_active: string;
}
