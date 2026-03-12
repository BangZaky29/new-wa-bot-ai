import { motion } from 'framer-motion';
import { Sparkles, Check, X, CreditCard } from 'lucide-react';
import type { PackageData, SubscriptionData } from './types';
import { PACKAGE_META } from './constants';
import { formatRupiah } from './helpers';

interface PackageCardsProps {
    packages: PackageData[];
    subscription: SubscriptionData | null;
    paymentLoading: boolean;
    snapReady: boolean;
    onSubscribe: (packageId: string) => void;
}

export function PackageCards({
    packages,
    subscription,
    paymentLoading,
    snapReady,
    onSubscribe
}: PackageCardsProps) {
    const isTrial = subscription?.payment_method === 'trial';

    return (
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
                                {pkg.has_discount ? (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-white">{formatRupiah(pkg.price)}</span>
                                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded uppercase">
                                                -{pkg.discount_percentage}%
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500 line-through">{formatRupiah(pkg.original_price!)}</span>
                                    </div>
                                ) : (
                                    <span className="text-2xl font-black text-white">{formatRupiah(pkg.price)}</span>
                                )}
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
                                    {f.proactive_config
                                        ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        : <X className="w-3.5 h-3.5 text-red-500/50 flex-shrink-0" />}
                                    <span className={!f.proactive_config ? 'text-slate-600' : ''}>Proactive Custom Config</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    {f.media_save_to_cloud
                                        ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        : <X className="w-3.5 h-3.5 text-red-500/50 flex-shrink-0" />}
                                    <span className={!f.media_save_to_cloud ? 'text-slate-600' : ''}>Cloud Media Storage</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    {f.group_chat_enabled
                                        ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        : <X className="w-3.5 h-3.5 text-red-500/50 flex-shrink-0" />}
                                    <span className={!f.group_chat_enabled ? 'text-slate-600' : ''}>Group Chat Integration</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                    <span>{f.max_contacts === 999 ? 'Unlimited' : f.max_contacts === 0 ? '0' : f.max_contacts} kontak whitelist</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                    <span>History {f.history_retention_days} hari</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    {f.log_monitor_enabled
                                        ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        : <X className="w-3.5 h-3.5 text-red-500/50 flex-shrink-0" />}
                                    <span className={!f.log_monitor_enabled ? 'text-slate-600' : ''}>Advanced Log Monitor</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => onSubscribe(pkg.id)}
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
    );
}
