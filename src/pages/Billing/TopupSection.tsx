import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Plus } from 'lucide-react';
import type { TopupTier, SubscriptionData } from './types';
import { formatRupiah } from './helpers';

interface TopupSectionProps {
    topupTiers: TopupTier[];
    subscription: SubscriptionData | null;
    paymentLoading: boolean;
    snapReady: boolean;
    onTopup: (amount: number) => void;
}

export function TopupSection({
    topupTiers,
    subscription,
    paymentLoading,
    snapReady,
    onTopup,
}: TopupSectionProps) {
    const [customAmount, setCustomAmount] = useState<string>('');
    const calculatedPrice = (parseInt(customAmount) || 0) * 15;

    return (
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

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {topupTiers.map((tier) => (
                    <button
                        key={tier.token_amount}
                        onClick={() => onTopup(tier.token_amount)}
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

                {/* Custom Topup Card */}
                <div className="glass-card rounded-xl border border-slate-700/50 p-4 flex flex-col justify-between group hover:border-cyan-500/40 transition-all col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Plus className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Custom</span>
                    </div>
                    <input
                        type="number"
                        min="100"
                        step="10"
                        placeholder="Jumlah..."
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="bg-slate-950/40 border border-slate-700/50 rounded-lg px-2 py-1.5 text-white text-xs font-bold mb-3 focus:border-cyan-500/50 outline-none w-full transition-colors"
                    />
                    <div className="flex items-center justify-between gap-2 mt-auto">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Harga</span>
                            <span className="text-[11px] text-white font-black">{formatRupiah(calculatedPrice)}</span>
                        </div>
                        <button
                            onClick={() => onTopup(parseInt(customAmount))}
                            disabled={!subscription || paymentLoading || !snapReady || !customAmount || parseInt(customAmount) < 100}
                            className="h-8 w-8 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/20 disabled:opacity-30 transition-all"
                            title="Beli Token Custom"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
