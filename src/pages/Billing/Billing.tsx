import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentApi } from '../../core/services/payment.api';
import type { PackageData, SubscriptionData, TokenTransaction, TopupTier } from './types';
import { CurrentPlanBanner } from './CurrentPlanBanner';
import { PackageCards } from './PackageCards';
import { TopupSection } from './TopupSection';
import { TransactionHistory } from './TransactionHistory';

interface BillingProps {
    userId: string;
}

export function Billing({ userId }: BillingProps) {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [tokenBalance, setTokenBalance] = useState(0);
    const [totalUsed, setTotalUsed] = useState(0);
    const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
    const [topupTiers, setTopupTiers] = useState<TopupTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [snapReady, setSnapReady] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const loadSnap = async () => {
            try {
                const config = await paymentApi.getMidtransConfig();
                if (config.success && config.snapJsUrl) {
                    if ((window as any).snap) {
                        setSnapReady(true);
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = config.snapJsUrl;
                    script.setAttribute('data-client-key', config.clientKey);
                    script.onload = () => setSnapReady(true);
                    script.onerror = () => console.error('Failed to load Midtrans Snap.js');
                    document.head.appendChild(script);
                }
            } catch (err) {
                console.error('Failed to load Midtrans config:', err);
            }
        };
        loadSnap();

        // Check for payment status in URL (Redirects from Midtrans)
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        if (status === 'finish') {
            showSuccess('✅ Pembayaran Berhasil! Data Anda sedang diperbarui.');
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
        } else if (status === 'error') {
            alert('❌ Terjadi kesalahan pada pembayaran. Silakan coba lagi.');
            window.history.replaceState({}, '', window.location.pathname);
        } else if (status === 'pending') {
            showSuccess('⏳ Pembayaran Tertunda. Silakan selesaikan pembayaran Anda.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pkgRes, subRes, tokRes, tierRes] = await Promise.all([
                paymentApi.getPackages(userId),
                paymentApi.getMySubscription(userId),
                paymentApi.getMyTokens(userId),
                paymentApi.getTopupTiers(),
            ]);

            if (pkgRes.success) setPackages(pkgRes.packages);
            if (subRes.success) setSubscription(subRes.subscription);
            if (tokRes.success) {
                setTokenBalance(tokRes.balance);
                setTotalUsed(tokRes.totalUsed);
                setTransactions(tokRes.transactions || []);
            }
            if (tierRes.success) setTopupTiers(tierRes.tiers);
        } catch (err) {
            console.error('Failed to load billing data:', err);
        }
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const openSnap = (snapToken: string) => {
        if (!(window as any).snap) {
            alert('Payment system is loading. Please try again.');
            return;
        }
        (window as any).snap.pay(snapToken, {
            onSuccess: () => {
                showSuccess('✅ Pembayaran berhasil! Memperbarui data...');
                setTimeout(() => fetchData(), 2000);
            },
            onPending: () => {
                showSuccess('⏳ Menunggu pembayaran...');
                fetchData();
            },
            onError: () => { alert('Pembayaran gagal. Silakan coba lagi.'); },
            onClose: () => { console.log('Snap popup closed'); }
        });
    };

    const handleSubscribe = async (packageId: string) => {
        setPaymentLoading(true);
        try {
            const res = await paymentApi.subscribe(userId, packageId);
            if (res.success && res.snapToken) {
                openSnap(res.snapToken);
            } else {
                alert(res.error || 'Gagal membuat pesanan.');
            }
        } catch (err) {
            console.error('Subscribe error:', err);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        }
        setPaymentLoading(false);
    };

    const handleTopup = async (tokenAmount: number) => {
        if (!subscription) {
            alert('Anda harus memiliki paket aktif untuk melakukan top-up.');
            return;
        }
        setPaymentLoading(true);
        try {
            const res = await paymentApi.topup(userId, tokenAmount);
            if (res.success && res.snapToken) {
                openSnap(res.snapToken);
            } else {
                alert(res.error || 'Gagal membuat pesanan top-up.');
            }
        } catch (err) {
            console.error('Topup error:', err);
        }
        setPaymentLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-500/90 backdrop-blur text-white font-bold rounded-xl shadow-lg shadow-green-500/30"
                    >
                        {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <CurrentPlanBanner
                subscription={subscription}
                tokenBalance={tokenBalance}
                totalUsed={totalUsed}
                onRefresh={fetchData}
            />

            <PackageCards
                packages={packages}
                subscription={subscription}
                paymentLoading={paymentLoading}
                snapReady={snapReady}
                onSubscribe={handleSubscribe}
            />

            <TopupSection
                topupTiers={topupTiers}
                subscription={subscription}
                paymentLoading={paymentLoading}
                snapReady={snapReady}
                onTopup={handleTopup}
            />

            <TransactionHistory transactions={transactions} />
        </div>
    );
}
