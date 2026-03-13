import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, CreditCard, Zap, ShieldCheck, RefreshCw } from 'lucide-react';
import { moderatorApi } from '../../../core/services/moderator.api';
import type { SystemStats as StatsType } from '../../../core/services/moderator.api';

export const SystemStats: React.FC = () => {
    const [stats, setStats] = useState<StatsType | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await moderatorApi.getStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    const cards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users className="w-6 h-6" />, color: 'from-blue-600/20 to-blue-400/20', text: 'text-blue-400' },
        { label: 'Cloud Media', value: stats?.totalMedia || 0, icon: <FileText className="w-6 h-6" />, color: 'from-violet-600/20 to-violet-400/20', text: 'text-violet-400' },
        { label: 'DB Transactions', value: stats?.totalTransactions || 0, icon: <Activity className="w-6 h-6" />, color: 'from-indigo-600/20 to-indigo-400/20', text: 'text-indigo-400' },
        { label: 'Active Subs', value: stats?.activeSubscriptions || 0, icon: <CreditCard className="w-6 h-6" />, color: 'from-emerald-600/20 to-emerald-400/20', text: 'text-emerald-400' },
        { label: 'Tokens Minted', value: stats?.totalTokensDistributed.toLocaleString() || 0, icon: <Zap className="w-6 h-6" />, color: 'from-amber-600/20 to-amber-400/20', text: 'text-amber-400' },
        { label: 'Mod Actions', value: stats?.totalModeratorActions || 0, icon: <ShieldCheck className="w-6 h-6" />, color: 'from-rose-600/20 to-rose-400/20', text: 'text-rose-400' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-white uppercase">Neural Metrics</h2>
                    <p className="text-slate-500 text-sm mt-1">Platform-wide infrastructure statistics</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="p-2.5 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/50 rounded-xl text-slate-400 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`relative group bg-gradient-to-br ${card.color} border border-white/5 rounded-3xl p-6 overflow-hidden backdrop-blur-md`}
                    >
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                        
                        <div className={`p-3 rounded-2xl bg-slate-950/40 w-fit mb-6 border border-white/5 ${card.text}`}>
                            {card.icon}
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-white tracking-widest">{card.value}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Additional visual polish: System Health Chart placeholder */}
            <div className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="w-5 h-5 text-violet-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Infrastructure Integrity</span>
                </div>
                <div className="h-48 w-full flex items-end gap-2">
                    {[40, 70, 45, 90, 65, 80, 55, 75, 50, 85, 60, 95].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05 + 0.5, type: 'spring' }}
                            className="flex-1 bg-gradient-to-t from-violet-600/40 to-indigo-500/10 rounded-t-md border-t border-violet-500/20"
                        />
                    ))}
                </div>
                <div className="mt-4 flex justify-between px-2">
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Network Load</span>
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Real-time Node Status</span>
                </div>
            </div>
        </div>
    );
};
