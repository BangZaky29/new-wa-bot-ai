import { motion } from 'framer-motion';
import { Crown, AlertTriangle, RefreshCw, Zap, TrendingUp, Clock } from 'lucide-react';
import type { SubscriptionData } from './types';
import { PACKAGE_META } from './constants';
import { formatDate } from './helpers';

interface CurrentPlanBannerProps {
    subscription: SubscriptionData | null;
    tokenBalance: number;
    totalUsed: number;
    onRefresh: () => void;
}

export function CurrentPlanBanner({
    subscription,
    tokenBalance,
    totalUsed,
    onRefresh
}: CurrentPlanBannerProps) {
    const daysLeft = subscription
        ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const tokenPercent = subscription
        ? Math.min(100, Math.round((tokenBalance / (subscription.packages?.token_amount || 1)) * 100))
        : 0;

    return (
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
                            {subscription ? <Crown className="w-7 h-7 text-white" /> :
                                <AlertTriangle className="w-7 h-7 text-yellow-300" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-white">
                                    {subscription
                                        ? `Paket ${subscription.packages?.display_name}`
                                        : 'Belum Berlangganan'}
                                </h2>
                            </div>
                            <p className="text-white/60 text-sm mt-0.5">
                                {subscription
                                    ? `Berlaku hingga ${formatDate(subscription.expires_at)} • ${daysLeft} hari tersisa`
                                    : 'Pilih paket untuk mengaktifkan bot AI Anda'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onRefresh}
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
    );
}
