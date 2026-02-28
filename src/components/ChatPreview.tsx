import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, User, Bot, Clock, RotateCcw } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';

interface ChatPreviewProps {
    jid: string;
    pushName: string;
    onClose: () => void;
}

export function ChatPreview({ jid, pushName, onClose }: ChatPreviewProps) {
    const { getChatHistory } = useWhatsApp();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const loadHistory = async () => {
        setLoading(true);
        const data = await getChatHistory(jid);
        setHistory(data);
        setLoading(false);
    };

    useEffect(() => {
        loadHistory();
        const interval = setInterval(loadHistory, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [jid]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-bold text-xl border border-cyan-500/20">
                            {pushName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-white font-bold">{pushName}</h3>
                            <p className="text-slate-500 text-xs font-mono">{jid.split('@')[0]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadHistory}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90"
                >
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                            <Clock className="w-8 h-8 opacity-20" />
                            <p className="text-sm italic">Belum ada riwayat chat.</p>
                        </div>
                    ) : (
                        history.map((msg, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg relative ${msg.role === 'user'
                                    ? 'bg-cyan-600 text-white rounded-tr-none'
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold uppercase tracking-wider">
                                        {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                        {msg.role === 'user' ? pushName : 'AI Bestie'}
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    <div className="mt-2 text-[9px] opacity-40 text-right font-mono">
                                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.latency && ` • ${msg.latency}ms`}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Footer (Info only for now) */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500 font-medium">
                        AI Bot Mode is Active • Responses are automated
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
