import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import type { TokenTransaction } from './types';
import { formatDateTime } from './helpers';

interface TransactionHistoryProps {
    transactions: TokenTransaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
    const [showHistory, setShowHistory] = useState(false);

    return (
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
    );
}
