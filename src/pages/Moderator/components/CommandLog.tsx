import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { moderatorApi } from '../../../core/services/moderator.api';
import type { ModeratorLog } from '../../../core/services/moderator.api';

export const CommandLog: React.FC = () => {
    const [logs, setLogs] = useState<ModeratorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'blocked' | 'cancelled'>('all');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await moderatorApi.getLogs();
            setLogs(data);
        } catch (err) {
            console.error('Failed to fetch logs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const filteredLogs = logs.filter(log => filter === 'all' || log.status === filter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'blocked': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
            case 'cancelled': return <Clock className="w-4 h-4 text-slate-500" />;
            default: return null;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'blocked': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'cancelled': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-white uppercase">Execution History</h2>
                    <p className="text-slate-500 text-sm mt-1">Audit log of all moderator commands</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="bg-slate-900/50 border border-slate-800/50 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-violet-500/50 uppercase tracking-widest"
                    >
                        <option value="all">ALL ENTRIES</option>
                        <option value="success">SUCCESS ONLY</option>
                        <option value="failed">FAILED ONLY</option>
                        <option value="blocked">BLOCKED ONLY</option>
                        <option value="cancelled">CANCELLED</option>
                    </select>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-2.5 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/50 rounded-xl text-slate-400 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden bg-slate-900/40 border border-slate-800/40 rounded-2xl backdrop-blur-sm">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800/50">
                            <thead>
                                <tr className="bg-slate-900/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Executed At</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Action</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Target</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Summary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <RefreshCw className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                                            No audit logs found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, idx) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-[11px] font-bold text-slate-400">
                                                    {new Date(log.executed_at).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-[9px] text-slate-600 mt-0.5">
                                                    {new Date(log.executed_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-black text-white uppercase tracking-wider">{log.parsed_action}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-medium text-slate-300">
                                                    {log.target_identifier || '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(log.status)}`}>
                                                    {getStatusIcon(log.status)}
                                                    {log.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-slate-400 line-clamp-1 max-w-xs group-hover:line-clamp-none transition-all">
                                                    {log.result_summary || log.reason || '—'}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
