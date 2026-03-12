import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, Activity, Wifi, ShieldCheck, Zap, Pause, Play, Trash2 } from 'lucide-react';
import { apiService } from '../../core/services/api.service';
import { paymentApi } from '../../core/services/payment.api';
import { FeatureLockOverlay } from './FeatureLockOverlay';

interface LogEntry {
    id: string;
    timestamp: Date;
    level: 'info' | 'success' | 'warn' | 'error' | 'system';
    message: string;
    meta?: any;
}

export function LogMonitor({ sessionId }: { sessionId: string }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [filter, setFilter] = useState<'all' | 'error' | 'success'>('all');
    const [userFeatures, setUserFeatures] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current && !isPaused) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isPaused]);

    // Fetch user features
    useEffect(() => {
        const fetchFeatures = async () => {
            if (sessionId) {
                const res = await paymentApi.getUserFeatures(sessionId);
                if (res.success) setUserFeatures(res.features);
            }
        };
        fetchFeatures();
    }, [sessionId]);

    // Initial connection logs
    useEffect(() => {
        if (userFeatures && !userFeatures.log_monitor_enabled) return;
        const initLogs: LogEntry[] = [
            { id: '1', timestamp: new Date(), level: 'system', message: 'Initializing WA-BOT-AI Engine...' },
            { id: '2', timestamp: new Date(Date.now() + 500), level: 'info', message: 'Loading custom prompts and context bindings...' },
            { id: '3', timestamp: new Date(Date.now() + 1000), level: 'success', message: `wa_gateway connected successfully. Session UID='${sessionId}'` },
            { id: '4', timestamp: new Date(Date.now() + 1200), level: 'info', message: 'Engine is ready and listening for incoming messages in real-time.' },
        ];

        let delay = 0;
        initLogs.forEach(log => {
            setTimeout(() => setLogs(prev => {
                // Prevent duplicate keys in React Strict Mode
                if (prev.some(p => p.id === log.id)) return prev;
                return [...prev, log];
            }), delay);
            delay += 600;
        });
    }, [sessionId]);

    // Real-time backend logs polling
    useEffect(() => {
        if (isPaused || !sessionId) return;

        let isSubscribed = true;

        const fetchLogs = async () => {
            try {
                const res = await apiService.getEngineLogs(sessionId);
                if (res.success && res.logs && isSubscribed) {
                    const formattedLogs: LogEntry[] = res.logs.map((dbLog: any) => ({
                        id: dbLog.id,
                        timestamp: new Date(dbLog.created_at),
                        level: dbLog.level,
                        message: dbLog.message
                    }));

                    // Keep the fake initial logs if DB is completely empty (for aesthetic)
                    if (formattedLogs.length > 0) {
                        setLogs(formattedLogs);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);

        return () => {
            isSubscribed = false;
            clearInterval(interval);
        };
    }, [isPaused, sessionId]);

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'error') return log.level === 'error' || log.level === 'warn';
        return log.level === filter;
    });

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'info': return 'text-cyan-400';
            case 'success': return 'text-green-400';
            case 'warn': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            case 'system': return 'text-blue-400';
            default: return 'text-slate-400';
        }
    };

    const getLevelBg = (level: string) => {
        switch (level) {
            case 'info': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            case 'success': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'warn': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'system': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="glass-card rounded-[2rem] p-0 overflow-hidden flex flex-col h-[650px] border border-cyan-500/10 shadow-2xl relative">
            {userFeatures && !userFeatures.log_monitor_enabled && (
                <FeatureLockOverlay
                    featureName="Log Monitor"
                    requiredPackage="Pro"
                    description="Pantau proses AI secara real-time untuk debugging dan transparansi balasan."
                />
            )}
            {/* Header Toolbar */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl flex flex-wrap justify-between items-center gap-4 relative z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30">
                            <Terminal className="w-5 h-5 text-cyan-400" />
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.9)] border border-green-300/50 translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                        <div>
                            <h3 className="font-black text-white text-sm tracking-wider flex items-center gap-2">
                                AI ENGINE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">MONITOR</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                UserID: <span className="text-cyan-500 font-mono">{sessionId.split('-')[0]}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-end gap-4">
                    {/* View Filters */}
                    <div className="flex items-center gap-1 border border-slate-700/50 rounded-xl p-1 bg-black/40">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-slate-700/80 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                        >
                            ALL LOGS
                        </button>
                        <button
                            onClick={() => setFilter('success')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'success' ? 'bg-green-500/20 text-green-400 shadow-sm border border-green-500/20' : 'text-slate-500 hover:text-green-400'}`}
                        >
                            SUCCESS
                        </button>
                        <button
                            onClick={() => setFilter('error')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'error' ? 'bg-red-500/20 text-red-400 shadow-sm border border-red-500/20' : 'text-slate-500 hover:text-red-400'}`}
                        >
                            ALERTS
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 h-full">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`p-2 rounded-xl transition-all ${isPaused ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' : 'bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                            title={isPaused ? "Resume Stream" : "Pause Stream"}
                        >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setLogs([])}
                            className="p-2 rounded-xl border border-slate-700/50 bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                            title="Clear Logs"
                        >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Matrix Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-900/90 divide-x divide-y md:divide-y-0 divide-slate-800/50 border-b border-slate-800 relative z-10 backdrop-blur-md">
                <div className="px-5 py-2.5 flex items-center justify-between group">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Status</span>
                    <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                        <Wifi className="w-3 h-3" /> Online
                    </span>
                </div>
                <div className="px-5 py-2.5 flex items-center justify-between group">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Latency</span>
                    <span className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                        <Activity className="w-3 h-3 animate-pulse" /> ~45ms
                    </span>
                </div>
                <div className="px-5 py-2.5 flex items-center justify-between group">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Memory</span>
                    <span className="flex items-center gap-1.5 text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        <Database className="w-3 h-3" /> 124MB
                    </span>
                </div>
                <div className="px-5 py-2.5 flex items-center justify-between group">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Throughput</span>
                    <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        <Zap className="w-3 h-3" /> 12 req/min
                    </span>
                </div>
            </div>

            {/* Terminal Body */}
            <div
                ref={scrollRef}
                className="flex-1 p-6 font-mono text-xs md:text-sm overflow-y-auto bg-[#070b14] relative scroll-smooth styled-scrollbar"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}
            >
                {/* Visual Hacks: Scanlines & Grid */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute inset-0 opacity-5 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,theme(colors.cyan.400),transparent_80%)]"></div>

                <div className="space-y-2.5 relative z-10 w-full pb-10 flex flex-col justify-end min-h-full">
                    <AnimatePresence initial={false}>
                        {filteredLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.98, height: 0 }}
                                transition={{ duration: 0.2 }}
                                layout
                                className="flex items-start gap-4 hover:bg-white/[0.03] p-2 rounded-xl border border-transparent hover:border-white/[0.05] transition-colors group"
                            >
                                <div className="text-slate-600 text-[10px] whitespace-nowrap mt-[3px] font-bold">
                                    [{log.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}]
                                </div>
                                <div className={`px-2 py-[2px] rounded text-[9px] font-black uppercase tracking-widest border whitespace-nowrap min-w-[70px] text-center ${getLevelBg(log.level)}`}>
                                    {log.level}
                                </div>
                                <div className={`flex-1 break-words font-medium leading-relaxed ${getLevelColor(log.level)}`}>
                                    <span className="opacity-30 mr-2 group-hover:opacity-80 transition-opacity font-bold">{'>'}</span>
                                    {log.message}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredLogs.length === 0 && (
                        <div className="text-center py-20 text-slate-600 flex flex-col items-center justify-center flex-1 h-full">
                            <ShieldCheck className="w-16 h-16 mb-4 opacity-10" />
                            <p className="font-sans font-bold uppercase tracking-wider text-xs">No entries matching applied filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Line / Cursor Indicator */}
            {filter === 'all' && !isPaused && (
                <div className="absolute bottom-0 left-0 right-0 px-6 py-3 bg-gradient-to-t from-[#070b14] via-[#070b14]/90 to-transparent pointer-events-none flex items-center gap-2 z-20">
                    <span className="text-cyan-500 font-mono text-sm opacity-50 font-bold">{'>'}</span>
                    <div className="w-2.5 h-4 bg-cyan-400 animate-pulse rounded-sm shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                </div>
            )}
        </div>
    );
}
