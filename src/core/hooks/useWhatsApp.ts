import { useState, useEffect, useCallback } from 'react';
import type { ConnectionStatus } from '../../types';
import { getSessionId, createSessionAxios } from './helpers';
import { usePrompts } from './usePrompts';
import { useContacts } from './useContacts';
import { useApiKeys } from './useApiKeys';
import { useBlockedAttempts } from './useBlockedAttempts';

export function useWhatsApp(sessionId?: string) {
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

    const promptsHook = usePrompts(sessionId);
    const contactsHook = useContacts(sessionId);
    const apiKeysHook = useApiKeys(sessionId);
    const blockedHook = useBlockedAttempts(sessionId);

    const fetchQR = useCallback(async () => {
        const currentSessionId = getSessionId(sessionId);
        if (!currentSessionId) return;
        try {
            const api = createSessionAxios(sessionId);
            const response = await api.get(`/api/whatsapp/${currentSessionId}/qr`);
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
        const currentSessionId = getSessionId(sessionId);
        if (!currentSessionId) return;
        try {
            const api = createSessionAxios(sessionId);
            const response = await api.get(`/api/whatsapp/${currentSessionId}/status`);
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
        const currentSessionId = getSessionId(sessionId);
        if (!currentSessionId) return;
        setInitializing(true);
        try {
            const api = createSessionAxios(sessionId);
            await api.post(`/api/whatsapp/${currentSessionId}/init`);
            setTimeout(fetchStatus, 2000);
        } catch (error) {
            console.error('Failed to initialize session:', error);
        } finally {
            setInitializing(false);
        }
    };

    const handleLogout = async () => {
        const currentSessionId = getSessionId(sessionId);
        if (!currentSessionId) return;
        try {
            const api = createSessionAxios(sessionId);
            await api.post(`/api/whatsapp/${currentSessionId}/logout`);
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
            const currentSessionId = getSessionId(sessionId);
            if (!currentSessionId) return { success: false, stats: [], global: { requests: 0, responses: 0 } };

            const api = createSessionAxios(sessionId);
            const response = await api.get('/api/whatsapp/stats/history');
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

    const getChatHistory = async (jid: string) => {
        try {
            const currentSessionId = getSessionId(sessionId);
            if (!currentSessionId) return [];

            const api = createSessionAxios(sessionId);
            const response = await api.get(`/api/whatsapp/history/${jid}`);
            return response.data.history || [];
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
            return [];
        }
    };

    const removeChatHistory = async (jids: string[]) => {
        try {
            const api = createSessionAxios(sessionId);
            await api.post('/api/whatsapp/history/delete', { jids });
            return true;
        } catch (error) {
            console.error('Failed to remove chat history:', error);
            return false;
        }
    };

    const requestWipeOtp = async () => {
        try {
            const currentSessionId = getSessionId(sessionId);
            if (!currentSessionId) return false;

            const api = createSessionAxios(sessionId);
            const response = await api.post('/api/whatsapp/account/wipe/otp');
            return response.data.success;
        } catch (error) {
            console.error('Failed to request wipe OTP:', error);
            return false;
        }
    };

    const wipeAccountData = async (otpCode: string) => {
        try {
            const api = createSessionAxios(sessionId);
            const response = await api.post('/api/whatsapp/account/wipe', { otpCode });
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
        // Base state & core
        status,
        loading,
        globalStats,
        initializing,
        fetchStatus,
        fetchStats,
        handleInit,
        handleLogout,
        getChatHistory,
        removeChatHistory,
        wipeAccountData,
        requestWipeOtp,

        // Extracted features (spread for backward compatibility for now)
        ...promptsHook,
        ...contactsHook,
        ...apiKeysHook,
        ...blockedHook
    };
}

// Re-export types that were moved to index.ts for backward compatibility
export type { PromptItem, ContactItem, ApiKeyItem, BlockedAttempt } from '../../types';
