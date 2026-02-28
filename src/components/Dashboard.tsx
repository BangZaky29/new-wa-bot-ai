import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import type { ChatStats } from '../types';

export function Dashboard() {
    const { fetchStats } = useWhatsApp();
    const [stats, setStats] = useState<ChatStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            const data = await fetchStats();
            setStats(data);
            setLoading(false);
        };
        loadStats();
        const interval = setInterval(loadStats, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</p>
                            <h3 className="text-2xl font-black text-white">{stats.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <MessageSquare className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Messages</p>
                            <h3 className="text-2xl font-black text-white">
                                {stats.reduce((acc, curr) => acc + curr.msg_count, 0)}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Today</p>
                            <h3 className="text-2xl font-black text-white">
                                {stats.filter(s => new Date(s.last_active).toDateString() === new Date().toDateString()).length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/50">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/20">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Active Chat Sessions</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] bg-slate-900/40">
                                <th className="px-6 py-4 font-black">User / Number</th>
                                <th className="px-6 py-4 font-black">Total Chat</th>
                                <th className="px-6 py-4 font-black">Last Activity</th>
                                <th className="px-6 py-4 font-black">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {stats.map((chat) => (
                                <motion.tr
                                    key={chat.jid}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-700/10 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-500 border border-slate-700 group-hover:border-cyan-500/50 transition-colors">
                                                {chat.push_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-tight">{chat.push_name}</p>
                                                <p className="text-[10px] text-slate-500 font-mono tracking-tight">{chat.jid.split('@')[0]}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                            {chat.msg_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-400">
                                            {new Date(chat.last_active).toLocaleString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: 'short'
                                            })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-500 transition-colors" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {stats.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-500 text-sm italic font-medium">
                                        Belum ada riwayat chat yang tersimpan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
