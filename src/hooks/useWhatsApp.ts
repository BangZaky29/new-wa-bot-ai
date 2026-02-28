import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { ConnectionStatus } from '../types';

const WA_API_BASE = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';
const SESSION_ID = import.meta.env.VITE_WA_SESSION_ID || 'wa-bot-ai';

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

export function useWhatsApp() {
    const [status, setStatus] = useState<ConnectionStatus>({
        success: false,
        status: 'disconnected',
        isConnected: false,
        phoneNumber: null,
        hasQR: false
    });
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);
    const [globalStats, setGlobalStats] = useState({ requests: 0, responses: 0 });

    const fetchQR = useCallback(async () => {
        try {
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/${SESSION_ID}/qr`);
            if (response.data.success && response.data.qrImage) {
                setStatus(prev => ({
                    ...prev,
                    qrImage: response.data.qrImage,
                    hasQR: true
                }));
            }
        } catch (error) {
            console.error('Failed to fetch QR:', error);
        }
    }, []);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/${SESSION_ID}/status`);
            const data = response.data;

            if (data.success) {
                setStatus(prev => ({
                    ...prev,
                    success: true,
                    status: data.status,
                    isConnected: data.isConnected,
                    phoneNumber: data.phoneNumber,
                    hasQR: data.hasQR
                }));

                if (data.hasQR && !status.qrImage) {
                    fetchQR();
                }
            }
        } catch (error) {
            console.error('Failed to fetch status:', error);
        } finally {
            setLoading(false);
        }
    }, [fetchQR, status.qrImage]);

    const handleInit = async () => {
        setInitializing(true);
        try {
            await axios.post(`${WA_API_BASE}/api/whatsapp/${SESSION_ID}/init`);
            setTimeout(fetchStatus, 2000);
        } catch (error) {
            console.error('Failed to initialize session:', error);
        } finally {
            setInitializing(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${WA_API_BASE}/api/whatsapp/${SESSION_ID}/logout`);
            setStatus({
                success: false,
                status: 'disconnected',
                isConnected: false,
                phoneNumber: null,
                hasQR: false
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/stats/history`);
            if (response.data.success) {
                setGlobalStats(response.data.global || { requests: 0, responses: 0 });
                return response.data;
            }
            return { success: false, stats: [], global: { requests: 0, responses: 0 } };
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            return { success: false, stats: [], global: { requests: 0, responses: 0 } };
        }
    }, []);

    // PROMPTS
    const getPrompts = async () => {
        try {
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/config/prompts`);
            return response.data.prompts as PromptItem[];
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
            return [];
        }
    };

    const savePrompt = async (name: string, content: string, isActive: boolean = false) => {
        try {
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/prompts`, { name, content, isActive });
            return true;
        } catch (error) {
            console.error('Failed to save prompt:', error);
            return false;
        }
    };

    const updatePrompt = async (id: string, name: string, content: string) => {
        try {
            await axios.put(`${WA_API_BASE}/api/whatsapp/config/prompts/${id}`, { name, content });
            return true;
        } catch (error) {
            console.error('Failed to update prompt:', error);
            return false;
        }
    };

    const activatePrompt = async (id: string) => {
        try {
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/prompts/activate`, { id });
            return true;
        } catch (error) {
            console.error('Failed to activate prompt:', error);
            return false;
        }
    };

    const removePrompt = async (id: string) => {
        try {
            await axios.delete(`${WA_API_BASE}/api/whatsapp/config/prompts/${id}`);
            return true;
        } catch (error) {
            console.error('Failed to remove prompt:', error);
            return false;
        }
    };

    // CONTACTS
    const getContacts = async () => {
        try {
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/config/contacts`);
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
            // NORMALIZATION: "08..." -> "628..."
            let cleanJid = jid.replace(/\D/g, '');
            if (cleanJid.startsWith('08')) {
                cleanJid = '628' + cleanJid.substring(2);
            }
            if (!cleanJid.endsWith('@s.whatsapp.net')) {
                cleanJid += '@s.whatsapp.net';
            }

            await axios.post(`${WA_API_BASE}/api/whatsapp/config/contacts`, { jid: cleanJid, name });
            return true;
        } catch (error) {
            console.error('Failed to add contact:', error);
            return false;
        }
    };

    const updateContact = async (jid: string, name: string) => {
        try {
            await axios.put(`${WA_API_BASE}/api/whatsapp/config/contacts/${jid}`, { name });
            return true;
        } catch (error) {
            console.error('Failed to update contact:', error);
            return false;
        }
    };

    const removeContact = async (jid: string) => {
        try {
            await axios.delete(`${WA_API_BASE}/api/whatsapp/config/contacts/${jid}`);
            return true;
        } catch (error) {
            console.error('Failed to remove contact:', error);
            return false;
        }
    };

    const updateTargetMode = async (mode: 'all' | 'specific') => {
        try {
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/target-mode`, { mode });
            return true;
        } catch (error) {
            console.error('Failed to update target mode:', error);
            return false;
        }
    };

    const getChatHistory = async (jid: string) => {
        try {
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/history/${jid}`);
            return response.data.history || [];
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    return {
        status,
        loading,
        globalStats,
        initializing,
        fetchStatus,
        fetchStats,
        getPrompts,
        savePrompt,
        updatePrompt,
        activatePrompt,
        removePrompt,
        getContacts,
        addContact,
        updateContact,
        removeContact,
        updateTargetMode,
        getChatHistory,
        handleInit,
        handleLogout
    };
}
