const baseApi = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';
const API_URL = baseApi.endsWith('/api') ? baseApi : `${baseApi}/api`;

export const apiService = {
    async register(data: { phone: string; username: string; full_name?: string; password?: string }) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async login(data: { identifier: string; password?: string }) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async verifyOtp(data: { userId: string; code: string }) {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async resendOtp(userId: string) {
        const response = await fetch(`${API_URL}/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        return response.json();
    },

    async getProfile(userId: string) {
        const response = await fetch(`${API_URL}/auth/me?userId=${userId}`);
        return response.json();
    },

    async updateProfile(data: { userId: string;[key: string]: any }) {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async getStatus(sessionId: string) {
        const response = await fetch(`${API_URL}/whatsapp/${sessionId}/status`);
        return response.json();
    }
};
