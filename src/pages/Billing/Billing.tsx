import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Zap, Crown, Star, Sparkles,
    ArrowRight, Check, X, Clock, TrendingUp,
    RefreshCw, ShoppingCart, ChevronDown, ChevronUp,
    Package, AlertTriangle, Gift
} from 'lucide-react';
import { paymentApi } from '../../core/services/payment.api';

// ─── Types ───
interface PackageData {
    id: string;
    name: string;
    display_name: string;
    price: number;
    token_amount: number;
    duration_days: number;
    features: Record<string, any>;
}

interface SubscriptionData {
    id: string;
    status: string;
    started_at: string;
    expires_at: string;
    payment_method: string;
    packages: PackageData;
}

interface TokenTransaction {
    id: string;
    amount: number;
    type: string;
    description: string;
    balance_after: number;
    created_at: string;
}

interface TopupTier {
    token_amount: number;
    price: number;
}

// ─── Helpers ───
const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

const PACKAGE_META: Record<string, { icon: any; gradient: string; badge: string; border: string; glow: string }> = {
    basic: {
        icon: Package,
        gradient: 'from-emerald-500 to-green-600',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        border: 'border-emerald-500/30 hover:border-emerald-400/60',
        glow: 'shadow-emerald-500/10',
    },
    premium: {
        icon: Star,
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        border: 'border-blue-500/30 hover:border-blue-400/60',
        glow: 'shadow-blue-500/10',
    },
    pro: {
        icon: Crown,
        gradient: 'from-purple-500 to-pink-600',
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        border: 'border-purple-500/30 hover:border-purple-400/60',
        glow: 'shadow-purple-500/10',
    },
};

// ─── Main Component ───
interface BillingProps {
    userId: string;
}

export function Billing({ userId }: BillingProps) {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [_features, setFeatures] = useState<Record<string, any>>({});
    const [tokenBalance, setTokenBalance] = useState(0);
    const [totalUsed, setTotalUsed] = useState(0);
    const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
    const [topupTiers, setTopupTiers] = useState<TopupTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [snapReady, setSnapReady] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // ─── Load Midtrans Snap.js ───
    useEffect(() => {
        const loadSnap = async () => {
            try {
                const config = await paymentApi.getMidtransConfig();
                if (config.success && config.snapJsUrl) {
                    // Check if already loaded
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
    }, []);

    // ─── Fetch All Data ───
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pkgRes, subRes, tokRes, tierRes] = await Promise.all([
                paymentApi.getPackages(),
                paymentApi.getMySubscription(userId),
                paymentApi.getMyTokens(userId),
                paymentApi.getTopupTiers(),
            ]);

            if (pkgRes.success) setPackages(pkgRes.packages);
            if (subRes.success) {
                setSubscription(subRes.subscription);
                setFeatures(subRes.features || {});
            }
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

    // ─── Pay with Snap ───
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

    // ─── Computed ───
    const daysLeft = subscription
        ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const isTrial = subscription?.payment_method === 'trial';
    const tokenPercent = subscription
        ? Math.min(100, Math.round((tokenBalance / (subscription.packages?.token_amount || 1)) * 100))
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ─── Success Toast ─── */}
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
            {/* ─── Current Plan Banner ─── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden"
            >
                <div className={`p-6 bg-gradient-to-r ${subscription
                    ? PACKAGE_META[subscription.packages?.name]?.gradient || 'from-slate-600 to-slate-700'
                    : 'from-slate-700 to-slate-800'
                    } bg-opacity-20`}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                                {isTrial ? <Gift className="w-7 h-7 text-white" /> :
                                    subscription ? <Crown className="w-7 h-7 text-white" /> :
                                        <AlertTriangle className="w-7 h-7 text-yellow-300" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-black text-white">
                                        {subscription
                                            ? isTrial
                                                ? 'TRIAL GRATIS'
                                                : `Paket ${subscription.packages?.display_name}`
                                            : 'Belum Berlangganan'}
                                    </h2>
                                    {isTrial && (
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                                            3 Hari
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/60 text-sm mt-0.5">
                                    {subscription
                                        ? `Berlaku hingga ${formatDate(subscription.expires_at)} • ${daysLeft} hari tersisa`
                                        : 'Pilih paket untuk mengaktifkan bot AI Anda'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={fetchData}
                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <RefreshCw className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Token Balance Section */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sisa Token</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{tokenBalance.toLocaleString()}</span>
                            <span className="text-xs text-slate-500">token</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${tokenPercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${tokenPercent > 50 ? 'bg-green-500' : tokenPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Digunakan</span>
                        </div>
                        <span className="text-3xl font-black text-white">{totalUsed.toLocaleString()}</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${subscription
                            ? daysLeft <= 3
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                : 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            {subscription ? (daysLeft <= 3 ? 'Segera Berakhir' : 'Aktif') : 'Tidak Aktif'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* ─── Package Cards ─── */}
            <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    {subscription ? 'Upgrade / Perpanjang Paket' : 'Pilih Paket'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map((pkg, idx) => {
                        const meta = PACKAGE_META[pkg.name] || PACKAGE_META.basic;
                        const Icon = meta.icon;
                        const isCurrentPlan = subscription?.packages?.name === pkg.name && !isTrial;
                        const f = pkg.features || {};

                        return (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`glass-card rounded-2xl border ${meta.border} p-6 transition-all hover:shadow-xl ${meta.glow} relative ${pkg.name === 'premium' ? 'md:scale-105 md:z-10' : ''
                                    }`}
                            >
                                {pkg.name === 'premium' && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-blue-500/30">
                                            Popular
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${meta.gradient} rounded-xl flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white">{pkg.display_name}</h4>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.badge}`}>
                                            {pkg.token_amount.toLocaleString()} token/bln
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="text-2xl font-black text-white">{formatRupiah(pkg.price)}</span>
                                    <span className="text-xs text-slate-500 ml-1">/bulan</span>
                                </div>

                                <ul className="space-y-2 mb-6 text-xs">
                                    <li className="flex items-center gap-2 text-slate-300">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>AI Response (10 token/pesan)</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        {f.proactive_enabled
                                            ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                            : <X className="w-3.5 h-3.5 text-red-500/50 flex-shrink-0" />}
                                        <span className={!f.proactive_enabled ? 'text-slate-600' : ''}>Proactive Nudge</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>{f.max_contacts === 999 ? 'Unlimited' : f.max_contacts} kontak</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>{f.max_prompts === 999 ? 'Unlimited' : f.max_prompts} prompt</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        {f.max_api_keys > 0
                                            ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                            : <X className="w-3.5 h-3.5 text-red-500/50 flex-shrink-0" />}
                                        <span className={f.max_api_keys === 0 ? 'text-slate-600' : ''}>{f.max_api_keys === 0 ? 'No BYOK' : f.max_api_keys === 999 ? 'Unlimited API Keys' : `${f.max_api_keys} API Key`}</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>History {f.history_retention_days} hari</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-slate-300">
                                        {f.log_monitor_enabled
                                            ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                            : <X className="w-3.5 h-3.5 text-red-500/50 flex-shrink-0" />}
                                        <span className={!f.log_monitor_enabled ? 'text-slate-600' : ''}>Log Monitor</span>
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(pkg.id)}
                                    disabled={paymentLoading || isCurrentPlan || !snapReady}
                                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isCurrentPlan
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : `bg-gradient-to-r ${meta.gradient} text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`
                                        }`}
                                >
                                    {isCurrentPlan ? (
                                        'Paket Aktif'
                                    ) : paymentLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    ) : (
                                        <>
                                            <CreditCard className="w-4 h-4" />
                                            {subscription ? 'Upgrade' : 'Berlangganan'}
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ─── Top-up Token ─── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-cyan-500" />
                    Top-up Token
                    {!subscription && (
                        <span className="text-[10px] text-yellow-500 font-normal normal-case ml-2">
                            (Perlu paket aktif)
                        </span>
                    )}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {topupTiers.map((tier) => (
                        <button
                            key={tier.token_amount}
                            onClick={() => handleTopup(tier.token_amount)}
                            disabled={!subscription || paymentLoading || !snapReady}
                            className="glass-card rounded-xl border border-slate-700/50 hover:border-cyan-500/40 p-4 transition-all text-left group disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span className="text-lg font-black text-white">{tier.token_amount.toLocaleString()}</span>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-cyan-400 transition-colors font-bold">
                                {formatRupiah(tier.price)}
                            </span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ─── Transaction History ─── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden"
            >
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                >
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        Riwayat Token
                    </h3>
                    {showHistory ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="border-t border-slate-800/50">
                                {transactions.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-slate-500 text-sm italic">
                                        Belum ada riwayat transaksi token.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
                                        {transactions.map((tx) => (
                                            <div key={tx.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-800/10">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {tx.amount > 0
                                                            ? <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                                                            : <ArrowRight className="w-4 h-4 rotate-[135deg]" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white font-bold">{tx.description}</p>
                                                        <p className="text-[10px] text-slate-500">{formatDateTime(tx.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-black ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600">{tx.balance_after.toLocaleString()} token</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
