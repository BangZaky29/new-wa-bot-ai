import type { PromptItem } from '../../types';
import { createSessionAxios } from './helpers';

/**
 * Hook for managing AI prompts (CRUD)
 */
export function usePrompts(sessionId?: string) {
    const getPrompts = async (): Promise<PromptItem[]> => {
        try {
            const api = createSessionAxios(sessionId);
            const response = await api.get('/api/whatsapp/config/prompts');
            return response.data.prompts as PromptItem[];
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
            return [];
        }
    };

    const savePrompt = async (name: string, content: string, isActive: boolean = false) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.post('/api/whatsapp/config/prompts', { name, content, isActive });
            return true;
        } catch (error) {
            console.error('Failed to save prompt:', error);
            return false;
        }
    };

    const updatePrompt = async (id: string, name: string, content: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.put(`/api/whatsapp/config/prompts/${id}`, { name, content });
            return true;
        } catch (error) {
            console.error('Failed to update prompt:', error);
            return false;
        }
    };

    const activatePrompt = async (id: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.post('/api/whatsapp/config/prompts/activate', { id });
            return true;
        } catch (error) {
            console.error('Failed to activate prompt:', error);
            return false;
        }
    };

    const removePrompt = async (id: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.delete(`/api/whatsapp/config/prompts/${id}`);
            return true;
        } catch (error) {
            console.error('Failed to remove prompt:', error);
            return false;
        }
    };

    return { getPrompts, savePrompt, updatePrompt, activatePrompt, removePrompt };
}
