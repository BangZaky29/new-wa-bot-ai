import axios from 'axios';

const WA_API_BASE = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';

/**
 * Get the current session ID from props or localStorage
 */
export function getStoredUserId(): string | null {
    const saved = localStorage.getItem('wa_user');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return parsed.id;
        } catch (e) {
            return null;
        }
    }
    return null;
}

/**
 * Get the effective session ID (prop or stored)
 */
export function getSessionId(sessionId?: string): string | null {
    return sessionId || getStoredUserId();
}

/**
 * Pre-configured axios instance with session ID header
 */
export function createSessionAxios(sessionId?: string) {
    const currentSessionId = getSessionId(sessionId);
    return {
        get: (url: string) => axios.get(`${WA_API_BASE}${url}`, {
            headers: { 'X-Session-Id': currentSessionId }
        }),
        post: (url: string, data?: any) => axios.post(`${WA_API_BASE}${url}`, data || {}, {
            headers: { 'X-Session-Id': currentSessionId }
        }),
        put: (url: string, data?: any) => axios.put(`${WA_API_BASE}${url}`, data || {}, {
            headers: { 'X-Session-Id': currentSessionId }
        }),
        patch: (url: string, data?: any) => axios.patch(`${WA_API_BASE}${url}`, data || {}, {
            headers: { 'X-Session-Id': currentSessionId }
        }),
        delete: (url: string) => axios.delete(`${WA_API_BASE}${url}`, {
            headers: { 'X-Session-Id': currentSessionId }
        }),
    };
}

export { WA_API_BASE };
