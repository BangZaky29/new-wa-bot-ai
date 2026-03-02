import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { ConnectionStatus } from '../../types';

const WA_API_BASE = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';

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

export function useWhatsApp(sessionId?: string) {
    const getStoredUserId = () => {
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
    };

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
        const currentSessionId = sessionId || getStoredUserId();
        if (!currentSessionId) return;
        try {
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/${currentSessionId}/qr`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
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
    }, [sessionId]);

    const fetchStatus = useCallback(async () => {
        const currentSessionId = sessionId || getStoredUserId();
        if (!currentSessionId) return;
        try {
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/${currentSessionId}/status`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
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
    }, [fetchQR, status.qrImage, sessionId]);

    const handleInit = async () => {
        const currentSessionId = sessionId || getStoredUserId();
        if (!currentSessionId) return;
        setInitializing(true);
        try {
            await axios.post(`${WA_API_BASE}/api/whatsapp/${currentSessionId}/init`, {}, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            setTimeout(fetchStatus, 2000);
        } catch (error) {
            console.error('Failed to initialize session:', error);
        } finally {
            setInitializing(false);
        }
    };

    const handleLogout = async () => {
        const currentSessionId = sessionId || getStoredUserId();
        if (!currentSessionId) return;
        try {
            await axios.post(`${WA_API_BASE}/api/whatsapp/${currentSessionId}/logout`, {}, {
                headers: { 'X-Session-Id': currentSessionId }
            });
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
            const currentSessionId = sessionId || getStoredUserId();
            if (!currentSessionId) return { success: false, stats: [], global: { requests: 0, responses: 0 } };

            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/stats/history`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            if (response.data.success) {
                setGlobalStats(response.data.global || { requests: 0, responses: 0 });
                return response.data;
            }
            return { success: false, stats: [], global: { requests: 0, responses: 0 } };
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            return { success: false, stats: [], global: { requests: 0, responses: 0 } };
        }
    }, [sessionId]);

    // PROMPTS
    const getPrompts = async () => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/config/prompts`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return response.data.prompts as PromptItem[];
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
            return [];
        }
    };

    const savePrompt = async (name: string, content: string, isActive: boolean = false) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/prompts`,
                { name, content, isActive },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to save prompt:', error);
            return false;
        }
    };

    const updatePrompt = async (id: string, name: string, content: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.put(`${WA_API_BASE}/api/whatsapp/config/prompts/${id}`,
                { name, content },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to update prompt:', error);
            return false;
        }
    };

    const activatePrompt = async (id: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/prompts/activate`,
                { id },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to activate prompt:', error);
            return false;
        }
    };

    const removePrompt = async (id: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.delete(`${WA_API_BASE}/api/whatsapp/config/prompts/${id}`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return true;
        } catch (error) {
            console.error('Failed to remove prompt:', error);
            return false;
        }
    };

    // CONTACTS
    const getContacts = async () => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/config/contacts`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
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
            // 1. Validasi Session ID
            const currentSessionId = sessionId || getStoredUserId();

            if (!currentSessionId) {
                console.error('❌ Session ID beneran kosong, login dulu bro.');
                return false;
            }

            // 2. Normalisasi JID (Pembersihan Nomor) agar tidak "Cannot find name 'cleanJid'"
            let cleanJid = jid.replace(/\D/g, ''); // Hapus semua karakter non-angka

            // Ubah format 08... jadi 628...
            if (cleanJid.startsWith('08')) {
                cleanJid = '628' + cleanJid.substring(2);
            }

            // Tambahkan suffix whatsapp jika belum ada
            if (!cleanJid.endsWith('@s.whatsapp.net')) {
                cleanJid += '@s.whatsapp.net';
            }

            console.log('🔍 [Frontend Debug] Sending Session ID:', currentSessionId);
            console.log('📱 [Frontend Debug] Adding JID:', cleanJid);

            // 3. Kirim ke Backend
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/contacts`,
                { jid: cleanJid, name },
                {
                    headers: {
                        'X-Session-Id': currentSessionId
                    }
                }
            );
            return true;
        } catch (error) {
            console.error('Failed to add contact:', error);
            return false;
        }
    };

    const updateContact = async (jid: string, name: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.put(`${WA_API_BASE}/api/whatsapp/config/contacts/${jid}`,
                { name },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to update contact:', error);
            return false;
        }
    };

    const removeContact = async (jid: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.delete(`${WA_API_BASE}/api/whatsapp/config/contacts/${jid}`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return true;
        } catch (error) {
            console.error('Failed to remove contact:', error);
            return false;
        }
    };

    const updateTargetMode = async (mode: 'all' | 'specific') => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/target-mode`,
                { mode },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to update target mode:', error);
            return false;
        }
    };

    const getChatHistory = async (jid: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            if (!currentSessionId) return [];

            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/history/${jid}`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return response.data.history || [];
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
            return [];
        }
    };

    // API KEYS
    const getKeys = async () => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/config/keys`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return response.data.keys as ApiKeyItem[];
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
            return [];
        }
    };

    const addKey = async (name: string, key: string, model?: string, version?: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/keys`,
                { name, key, model, version },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to add API key:', error);
            return false;
        }
    };

    const updateKey = async (id: string, name: string, key?: string, model?: string, version?: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.put(`${WA_API_BASE}/api/whatsapp/config/keys/${id}`,
                { name, key, model, version },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to update API key:', error);
            return false;
        }
    };

    const removeKey = async (id: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.delete(`${WA_API_BASE}/api/whatsapp/config/keys/${id}`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return true;
        } catch (error) {
            console.error('Failed to remove API key:', error);
            return false;
        }
    };

    const activateKey = async (id: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.patch(`${WA_API_BASE}/api/whatsapp/config/keys/${id}/activate`, {}, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return true;
        } catch (error) {
            console.error('Failed to activate API key:', error);
            return false;
        }
    };

    const getBlockedAttempts = async () => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            const response = await axios.get(`${WA_API_BASE}/api/whatsapp/config/blocked`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return response.data.attempts as BlockedAttempt[];
        } catch (error) {
            console.error('Failed to fetch blocked attempts:', error);
            return [];
        }
    };

    const whitelistBlocked = async (jid: string, name: string) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.post(`${WA_API_BASE}/api/whatsapp/config/blocked/whitelist`,
                { jid, name },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to whitelist blocked contact:', error);
            return false;
        }
    };

    const removeChatHistory = async (jids: string[]) => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            await axios.post(`${WA_API_BASE}/api/whatsapp/history/delete`,
                { jids },
                { headers: { 'X-Session-Id': currentSessionId } }
            );
            return true;
        } catch (error) {
            console.error('Failed to remove chat history:', error);
            return false;
        }
    };

    const wipeAccountData = async () => {
        try {
            const currentSessionId = sessionId || getStoredUserId();
            const response = await axios.post(`${WA_API_BASE}/api/whatsapp/account/wipe`, {}, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            return response.data.success;
        } catch (error) {
            console.error('Failed to wipe account data:', error);
            return false;
        }
    };

    useEffect(() => {
        if (sessionId) {
            fetchStatus();
            const interval = setInterval(fetchStatus, 10000);
            return () => clearInterval(interval);
        }
    }, [fetchStatus, sessionId]);

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
        getBlockedAttempts,
        whitelistBlocked,
        getChatHistory,
        removeChatHistory,
        wipeAccountData,
        getKeys,
        addKey,
        updateKey,
        removeKey,
        activateKey,
        handleInit,
        handleLogout
    };
}
