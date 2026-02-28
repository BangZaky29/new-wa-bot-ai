import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { ConnectionStatus } from '../types';

const WA_API_BASE = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';
const SESSION_ID = import.meta.env.VITE_WA_SESSION_ID || 'wa-bot-ai';

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
        if (!confirm('Are you sure you want to stop this bot?')) return;
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
                return response.data.stats;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    return {
        status,
        loading,
        initializing,
        fetchStatus,
        fetchStats,
        handleInit,
        handleLogout
    };
}
