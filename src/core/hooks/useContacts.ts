import type { ContactItem } from '../../types';
import { getSessionId, createSessionAxios } from './helpers';

/**
 * Hook for managing WhatsApp contacts and target mode
 */
export function useContacts(sessionId?: string) {
    const getContacts = async () => {
        try {
            const api = createSessionAxios(sessionId);
            const response = await api.get('/api/whatsapp/config/contacts');
            return {
                contacts: response.data.contacts as ContactItem[],
                mode: response.data.mode as 'all' | 'specific'
            };
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            return { contacts: [], mode: 'all' as const };
        }
    };

    const addContact = async (jid: string, name: string) => {
        try {
            const currentSessionId = getSessionId(sessionId);
            if (!currentSessionId) {
                console.error('❌ Session ID beneran kosong, login dulu bro.');
                return false;
            }

            // Normalisasi JID
            let cleanJid = jid.replace(/\D/g, '');
            if (cleanJid.startsWith('08')) {
                cleanJid = '628' + cleanJid.substring(2);
            }
            if (!cleanJid.endsWith('@s.whatsapp.net')) {
                cleanJid += '@s.whatsapp.net';
            }

            console.log('🔍 [Frontend Debug] Sending Session ID:', currentSessionId);
            console.log('📱 [Frontend Debug] Adding JID:', cleanJid);

            const api = createSessionAxios(sessionId);
            await api.post('/api/whatsapp/config/contacts', { jid: cleanJid, name });
            return true;
        } catch (error) {
            console.error('Failed to add contact:', error);
            return false;
        }
    };

    const updateContact = async (jid: string, name: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.put(`/api/whatsapp/config/contacts/${jid}`, { name });
            return true;
        } catch (error) {
            console.error('Failed to update contact:', error);
            return false;
        }
    };

    const removeContact = async (jid: string) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.delete(`/api/whatsapp/config/contacts/${jid}`);
            return true;
        } catch (error) {
            console.error('Failed to remove contact:', error);
            return false;
        }
    };

    const updateTargetMode = async (mode: 'all' | 'specific') => {
        try {
            const api = createSessionAxios(sessionId);
            await api.post('/api/whatsapp/config/target-mode', { mode });
            return true;
        } catch (error) {
            console.error('Failed to update target mode:', error);
            return false;
        }
    };

    return { getContacts, addContact, updateContact, removeContact, updateTargetMode };
}
