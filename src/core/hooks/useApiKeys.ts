import type { ApiKeyItem } from '../../types';
import { createSessionAxios } from './helpers';

/**
 * Hook for managing Gemini API keys (CRUD + activate)
 */
export function useApiKeys(sessionId?: string) {
    const getKeys = async (): Promise<ApiKeyItem[]> => {
        try {
            const api = createSessionAxios(sessionId);
            const response = await api.get('/api/whatsapp/config/keys');
            return response.data.keys as ApiKeyItem[];
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
            return [];
        }
    };

    const addKey = async (name: string, key: string, model?: string, version?: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.post('/api/whatsapp/config/keys', { name, key, model, version });
            return true;
        } catch (error) {
            console.error('Failed to add API key:', error);
            return false;
        }
    };

    const updateKey = async (id: string, name: string, key?: string, model?: string, version?: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.put(`/api/whatsapp/config/keys/${id}`, { name, key, model, version });
            return true;
        } catch (error) {
            console.error('Failed to update API key:', error);
            return false;
        }
    };

    const removeKey = async (id: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.delete(`/api/whatsapp/config/keys/${id}`);
            return true;
        } catch (error) {
            console.error('Failed to remove API key:', error);
            return false;
        }
    };

    const activateKey = async (id: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.patch(`/api/whatsapp/config/keys/${id}/activate`);
            return true;
        } catch (error) {
            console.error('Failed to activate API key:', error);
            return false;
        }
    };

    return { getKeys, addKey, updateKey, removeKey, activateKey };
}
