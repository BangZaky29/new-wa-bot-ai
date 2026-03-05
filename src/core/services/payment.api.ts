const baseApi = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';
const API_URL = baseApi.endsWith('/api') ? baseApi : `${baseApi}/api`;

/**
 * Payment API Service
 * Handles all payment-related API calls to the backend.
 */
export const paymentApi = {
    // ── Packages ──
    async getPackages() {
        const res = await fetch(`${API_URL}/payment/packages`);
        return res.json();
    },

    async getMidtransConfig() {
        const res = await fetch(`${API_URL}/payment/config`);
        return res.json();
    },

    async getTopupTiers() {
        const res = await fetch(`${API_URL}/payment/topup-tiers`);
        return res.json();
    },

    // ── Subscription ──
    async subscribe(userId: string, packageId: string) {
        const res = await fetch(`${API_URL}/payment/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': userId,
            },
            body: JSON.stringify({ packageId }),
        });
        return res.json();
    },

    async getMySubscription(userId: string) {
        const res = await fetch(`${API_URL}/payment/my-subscription`, {
            headers: { 'X-Session-Id': userId },
        });
        return res.json();
    },

    // ── Tokens ──
    async topup(userId: string, tokenAmount: number) {
        const res = await fetch(`${API_URL}/payment/topup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': userId,
            },
            body: JSON.stringify({ tokenAmount }),
        });
        return res.json();
    },

    async getMyTokens(userId: string) {
        const res = await fetch(`${API_URL}/payment/my-tokens`, {
            headers: { 'X-Session-Id': userId },
        });
        return res.json();
    },

    // ── Payment Status ──
    async getPaymentStatus(userId: string, orderId: string) {
        const res = await fetch(`${API_URL}/payment/status/${orderId}`, {
            headers: { 'X-Session-Id': userId },
        });
        return res.json();
    },
};
