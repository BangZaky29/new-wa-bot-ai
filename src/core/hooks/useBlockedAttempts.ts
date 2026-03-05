import type { BlockedAttempt } from '../../types';
import { createSessionAxios } from './helpers';

/**
 * Hook for managing blocked contact attempts
 */
export function useBlockedAttempts(sessionId?: string) {
    const getBlockedAttempts = async (): Promise<BlockedAttempt[]> => {
        try {
            const api = createSessionAxios(sessionId);
            const response = await api.get('/api/whatsapp/config/blocked');
            return response.data.attempts as BlockedAttempt[];
        } catch (error) {
            console.error('Failed to fetch blocked attempts:', error);
            return [];
        }
    };

    const whitelistBlocked = async (jid: string, name: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.post('/api/whatsapp/config/blocked/whitelist', { jid, name });
            return true;
        } catch (error) {
            console.error('Failed to whitelist blocked contact:', error);
            return false;
        }
    };

    const removeBlockedAttempt = async (jid: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.post('/api/whatsapp/config/blocked/delete', { jid });
            return true;
        } catch (error) {
            console.error('Failed to remove blocked attempt:', error);
            return false;
        }
    };

    return { getBlockedAttempts, whitelistBlocked, removeBlockedAttempt };
}
