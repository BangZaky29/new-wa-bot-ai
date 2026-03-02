import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { useWhatsApp } from '../../core/hooks/useWhatsApp';
import { ChatPreview } from '../../ui/components/ChatPreview';
import type { ChatStats } from '../../types';

export function Dashboard() {
    const { fetchStats, removeChatHistory } = useWhatsApp();
    const [stats, setStats] = useState<ChatStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<{ jid: string, name: string } | null>(null);
    const [selectedJids, setSelectedJids] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            const data = await fetchStats();
            if (data.success && data.stats) {
                setStats(data.stats);
            }
            setLoading(false);
        };
        loadStats();
        const interval = setInterval(loadStats, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [fetchStats]);

    const toggleSelect = (jid: string) => {
        setSelectedJids(prev =>
            prev.includes(jid) ? prev.filter(j => j !== jid) : [...prev, jid]
        );
    };

    const toggleSelectAll = () => {
        if (selectedJids.length === stats.length) {
            setSelectedJids([]);
        } else {
            setSelectedJids(stats.map(s => s.jid));
        }
    };

    const handleDeleteHistory = async (jids: string[]) => {
        if (!confirm(`Konfirmasi: Hapus total ${jids.length} riwayat chat ini? Data di database akan dihapus permanen.`)) return;

        setIsDeleting(true);
        try {
            const success = await removeChatHistory(jids);
            if (success) {
                const data = await fetchStats();
                if (data.success && data.stats) setStats(data.stats);
                setSelectedJids([]);
            }
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsDeleting(false);
        }
    };

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
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Active Chat Sessions</h3>

                    {selectedJids.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => handleDeleteHistory(selectedJids)}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-900/20"
                        >
                            <Trash2 className="w-4 h-4" />
                            Hapus Terpilih ({selectedJids.length})
                        </motion.button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] bg-slate-900/40">
                                <th className="px-6 py-4 font-black w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedJids.length === stats.length && stats.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                                    />
                                </th>
                                <th className="px-6 py-4 font-black">User / Number</th>
                                <th className="px-6 py-4 font-black">Total Chat</th>
                                <th className="px-6 py-4 font-black">Latency</th>
                                <th className="px-6 py-4 font-black">Last Activity</th>
                                <th className="px-6 py-4 font-black text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {stats.map((chat) => (
                                <motion.tr
                                    key={chat.jid}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`hover:bg-slate-700/10 transition-colors group ${selectedJids.includes(chat.jid) ? 'bg-cyan-500/5' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedJids.includes(chat.jid)}
                                            onChange={() => toggleSelect(chat.jid)}
                                            className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                                        />
                                    </td>
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
                                        {chat.last_latency ? (
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold ${chat.last_latency < 3000 ? 'text-green-500' : chat.last_latency < 7000 ? 'text-yellow-500' : 'text-orange-500'}`}>
                                                    {(chat.last_latency / 1000).toFixed(1)}s
                                                </span>
                                                <div className="w-12 h-1 background-slate-800 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full ${chat.last_latency < 3000 ? 'bg-green-500' : chat.last_latency < 7000 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                                                        style={{ width: `${Math.min(100, (chat.last_latency / 10000) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 font-bold italic">N/A</span>
                                        )}
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
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleDeleteHistory([chat.jid])}
                                                className="p-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Hapus Riwayat"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedChat({ jid: chat.jid, name: chat.push_name })}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-500 transition-colors" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {stats.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500 text-sm italic font-medium">
                                        Belum ada riwayat chat yang tersimpan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedChat && (
                    <ChatPreview
                        jid={selectedChat.jid}
                        pushName={selectedChat.name}
                        onClose={() => setSelectedChat(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
