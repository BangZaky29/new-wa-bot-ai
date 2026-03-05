import { motion } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            </div>
        </motion.div>
    );
}
