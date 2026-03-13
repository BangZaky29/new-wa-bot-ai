import axios from 'axios';

const API_BASE = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

export interface ModeratorLog {
    id: string;
    moderator_phone: string;
    raw_command: string;
    parsed_action: string;
    target_identifier: string | null;
    status: 'success' | 'failed' | 'blocked' | 'cancelled';
    reason: string | null;
    result_summary: string | null;
    executed_at: string;
}

export interface UserInfo {
    id: string;
    phone: string;
    email: string | null;
    full_name: string | null;
    username: string | null;
    role: string;
    created_at: string;
    token_balance?: number;
    total_used?: number;
    active_package?: string | null;
    media_count?: number;
}

export interface SystemStats {
    totalUsers: number;
    totalMedia: number;
    totalTransactions: number;
    activeSubscriptions: number;
    totalTokensDistributed: number;
    totalModeratorActions: number;
}

/**
 * Moderator API — calls BE endpoints at /api/moderator/*
 */
export const moderatorApi = {
    getUsers: async (): Promise<UserInfo[]> => {
        const { data } = await api.get<UserInfo[]>('/api/moderator/users');
        return data;
    },

    getLogs: async (limit = 50): Promise<ModeratorLog[]> => {
        const { data } = await api.get<ModeratorLog[]>(`/api/moderator/logs?limit=${limit}`);
        return data;
    },

    getStats: async (): Promise<SystemStats> => {
        const { data } = await api.get<SystemStats>('/api/moderator/stats');
        return data;
    },

    getUserRole: async (identifier: string): Promise<string | null> => {
        const { data } = await api.get<{ role: string }>(`/api/moderator/role/${encodeURIComponent(identifier)}`);
        return data?.role || null;
    },
    executeCommand: async (action: string, target: any, params: any = {}): Promise<{ success: boolean; result: string }> => {
        const { data } = await api.post('/api/moderator/execute', { action, target, params });
        return data;
    },
};
