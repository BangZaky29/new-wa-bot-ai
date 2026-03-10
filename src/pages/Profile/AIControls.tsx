import { useState, useEffect } from 'react';
import { Bot, Zap, Clock, Edit3, Save, X, RefreshCcw, CheckCircle } from 'lucide-react';
import { apiService } from '../../core/services/api.service';
import { paymentApi } from '../../core/services/payment.api';
import { AnimatePresence, motion } from 'framer-motion';
import { SubscribeBadge } from '../../ui/components/SubscribeBadge';

interface AIControlsProps {
    userId: string;
}

export function AIControls({ userId }: AIControlsProps) {
    const [aiControls, setAiControls] = useState({
        is_ai_enabled: true,
        is_proactive_enabled: true,
        response_delay_mins: 0
    });
    const [loadingControls, setLoadingControls] = useState(false);
    const [savingControls, setSavingControls] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [isEditingAI, setIsEditingAI] = useState(false);
    const [originalAiControls, setOriginalAiControls] = useState({
        is_ai_enabled: true,
        is_proactive_enabled: true,
        response_delay_mins: 0
    });
    const [userFeatures, setUserFeatures] = useState<any>(null);

    useEffect(() => {
        if (userId) {
            fetchAIControls();
            fetchUserFeatures();
        }
    }, [userId]);

    const fetchUserFeatures = async () => {
        try {
            const res = await paymentApi.getUserFeatures(userId);
            if (res.success) {
                setUserFeatures(res.features);
            }
        } catch (err) {
            console.error('Failed to fetch features:', err);
        }
    };

    const fetchAIControls = async () => {
        setLoadingControls(true);
        try {
            const res = await apiService.getAIControls(userId);
            if (res.success) {
                setAiControls(res.controls);
                setOriginalAiControls(res.controls);
            }
        } catch (err) {
            console.error('Failed to fetch AI controls:', err);
        } finally {
            setLoadingControls(false);
        }
    };

    const handleUpdateAIControls = async () => {
        setSavingControls(true);
        try {
            const res = await apiService.updateAIControls(userId, aiControls);
            if (res.success) {
                setShowSaveSuccess(true);
                setOriginalAiControls(aiControls);
                setIsEditingAI(false);
                setTimeout(() => setShowSaveSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Failed to update AI controls:', err);
        } finally {
            setSavingControls(false);
        }
    };

    const handleCancelAIEdit = () => {
        setAiControls(originalAiControls);
        setIsEditingAI(false);
    };

    return (
        <div className="glass-card rounded-[2rem] p-8 border border-slate-800/50 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full -mr-16 -mt-16"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                    <Bot className="w-6 h-6 text-cyan-500" />
                    AI Control Center
                </h3>
                <div className="flex gap-2 relative z-10">
                    {!isEditingAI ? (
                        <button
                            onClick={() => setIsEditingAI(true)}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-[10px] tracking-widest transition-all border border-slate-700 flex items-center justify-center gap-2"
                        >
                            <Edit3 className="w-3 h-3" /> EDIT SETTINGS
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleUpdateAIControls}
                                disabled={savingControls || loadingControls}
                                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-black text-[10px] tracking-widest transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                            >
                                {savingControls ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                {savingControls ? 'SAVING...' : 'SAVE SETTINGS'}
                            </button>
                            <button
                                onClick={handleCancelAIEdit}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-black text-[10px] tracking-widest transition-all border border-slate-700 flex items-center justify-center gap-2"
                            >
                                <X className="w-3 h-3" /> CANCEL
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 transition-all ${!isEditingAI ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}`}>
                {/* AI Response Toggle */}
                <div className={`p-6 rounded-3xl border transition-all cursor-pointer ${aiControls.is_ai_enabled ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/30 border-slate-700/30'}`}
                    onClick={() => isEditingAI && setAiControls({ ...aiControls, is_ai_enabled: !aiControls.is_ai_enabled })}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${aiControls.is_ai_enabled ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            <Bot className="w-6 h-6" />
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-all ${aiControls.is_ai_enabled ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${aiControls.is_ai_enabled ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <h4 className="font-black text-white text-sm mb-1 uppercase">AI Response</h4>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                        {aiControls.is_ai_enabled ? 'AI is actively responding to chats' : 'AI is currently offline/paused'}
                    </p>
                </div>

                {/* Proactive Toggle */}
                <div className={`p-6 rounded-3xl border transition-all relative ${!userFeatures?.proactive_enabled ? 'cursor-default border-slate-700/30' : 'cursor-pointer'} ${aiControls.is_proactive_enabled && userFeatures?.proactive_enabled ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-800/30 border-slate-700/30'}`}
                    onClick={() => isEditingAI && userFeatures?.proactive_enabled && setAiControls({ ...aiControls, is_proactive_enabled: !aiControls.is_proactive_enabled })}>

                    {!userFeatures?.proactive_enabled && (
                        <div className="absolute top-4 right-4 z-20">
                            <SubscribeBadge featureName="Proactive Nudge" requiredPackage="Premium" />
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${aiControls.is_proactive_enabled && userFeatures?.proactive_enabled ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-all ${aiControls.is_proactive_enabled && userFeatures?.proactive_enabled ? 'bg-purple-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${aiControls.is_proactive_enabled && userFeatures?.proactive_enabled ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <h4 className="font-black text-white text-sm mb-1 uppercase">Proactive Nudge</h4>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                        {!userFeatures?.proactive_enabled ? 'Requires Premium upgrade' : aiControls.is_proactive_enabled ? 'Automatic follow-ups enabled' : 'Automatic nudges are disabled'}
                    </p>
                </div>

                {/* Response Delay */}
                <div className="p-6 rounded-3xl border bg-slate-800/30 border-slate-700/30 transition-all relative">
                    {userFeatures?.max_delay_mins < 30 && (
                        <div className="absolute top-4 right-4 z-20">
                            <SubscribeBadge featureName="Extended Delay (30m)" requiredPackage="Pro" />
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-black text-white">{aiControls.response_delay_mins}</span>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">MINS DELAY</span>
                        </div>
                    </div>
                    <h4 className="font-black text-white text-sm mb-3 uppercase">Wait Time</h4>
                    <input
                        type="range"
                        min="0"
                        max={userFeatures?.max_delay_mins || 5}
                        disabled={!isEditingAI}
                        value={aiControls.response_delay_mins}
                        onChange={(e) => setAiControls({ ...aiControls, response_delay_mins: Math.min(parseInt(e.target.value), userFeatures?.max_delay_mins || 5) })}
                        className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${!isEditingAI ? 'cursor-not-allowed opacity-50' : ''}`}
                    />
                    <div className="flex justify-between mt-2 text-[8px] font-black text-slate-600 uppercase">
                        <span>Instant</span>
                        <span>{userFeatures?.max_delay_mins || 5} Mins</span>
                    </div>
                </div>
            </div>

            {/* Success Notification */}
            <AnimatePresence>
                {showSaveSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] px-8 py-4 bg-cyan-500 text-white rounded-[2rem] font-black text-xs tracking-widest shadow-2xl flex items-center gap-4 border-4 border-white/20 backdrop-blur-md"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        SETTINGS SAVED SUCCESSFULLY!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
