import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Shield, Settings, LogOut, Edit3, CheckCircle, AtSign, Save, X, Bot, Zap, Clock, RefreshCcw } from 'lucide-react';
import { apiService } from '../../core/services/api.service';
import { useState, useEffect } from 'react';

interface ProfileProps {
    user: any;
    status: any;
    onLogout: () => void;
    onNavigateAuth?: (view: 'login' | 'register') => void;
}

export function Profile({ user: initialUser, status, onLogout, onNavigateAuth }: ProfileProps) {
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || ''
    });
    const [saving, setSaving] = useState(false);
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

    useEffect(() => {
        if (user?.id) {
            fetchAIControls();
        }
    }, [user?.id]);

    const fetchAIControls = async () => {
        setLoadingControls(true);
        try {
            const res = await apiService.getAIControls(user.id);
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
            const res = await apiService.updateAIControls(user.id, aiControls);
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

    const isDataEmpty = !user || (!user.phone && !user.username);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const res = await apiService.updateProfile({
                userId: user.id,
                ...editForm
            });
            if (res.success) {
                setUser(res.user);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Profile Header Card */}
            <div className="glass-card rounded-[2.5rem] p-8 border border-slate-800/50 relative overflow-hidden text-slate-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 blur-[40px] rounded-full -ml-12 -mb-12"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-1 shadow-2xl shadow-purple-500/20">
                            <div className="w-full h-full bg-slate-900 rounded-[1.4rem] flex items-center justify-center overflow-hidden">
                                <User className="w-16 h-16 text-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        {isDataEmpty ? (
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Session Expired</h2>
                                <p className="text-slate-400 font-medium">Please login again to access your profile.</p>
                            </div>
                        ) : isEditing ? (
                            <div className="space-y-3 max-w-xs mx-auto md:mx-0">
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold"
                                    placeholder="Full Name"
                                />
                            </div>
                        ) : (
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                {user?.full_name || 'Anonymous Agent'}
                            </h2>
                        )}
                        {!isDataEmpty && (
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center mt-2">
                                <span className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <AtSign className="w-3 h-3 text-purple-500" /> {user?.username || 'no-username'}
                                </span>
                                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> {user?.role || 'User'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {isDataEmpty ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => onNavigateAuth?.('login')}
                                    className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    GO TO LOGIN
                                </button>
                                <button
                                    onClick={() => onNavigateAuth?.('register')}
                                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-xs tracking-widest transition-all border border-slate-700"
                                >
                                    REGISTER NEW ACCOUNT
                                </button>
                            </div>
                        ) : (
                            <>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdate}
                                            disabled={saving}
                                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-500 rounded-xl font-black text-[10px] tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <Save className="w-3 h-3" /> {saving ? 'SAVING...' : 'SAVE'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-xl font-black text-[10px] tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <X className="w-3 h-3" /> CANCEL
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-2xl font-black text-xs tracking-widest transition-all flex items-center gap-3"
                                    >
                                        <Edit3 className="w-4 h-4" /> EDIT PROFILE
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-2xl font-black text-xs tracking-widest transition-all flex items-center gap-3"
                                >
                                    <LogOut className="w-4 h-4" /> LOGOUT
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-200">
                <div className="glass-card rounded-[2rem] p-6 border border-slate-800/50 space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                        Account Details
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</p>
                                <p className="font-bold text-white">+{user?.phone || 'Not Linked'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700/30 rounded-lg px-2 py-1 text-xs text-white"
                                    />
                                ) : (
                                    <p className="font-bold text-white">{user?.email || 'not_set@example.com'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[2rem] p-6 border border-slate-800/50 space-y-6 text-slate-200">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        System Status
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auth Provider</p>
                                    <p className="font-bold text-white">Supabase Auth</p>
                                </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WA Session</p>
                                    <p className={`font-bold ${status?.isConnected ? 'text-cyan-400' : 'text-red-500'}`}>
                                        {status?.isConnected ? 'ACTIVE' : 'DISCONNECTED'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Control Settings */}
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
                    <div className={`p-6 rounded-3xl border transition-all cursor-pointer ${aiControls.is_proactive_enabled ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-800/30 border-slate-700/30'}`}
                        onClick={() => isEditingAI && setAiControls({ ...aiControls, is_proactive_enabled: !aiControls.is_proactive_enabled })}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${aiControls.is_proactive_enabled ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-all ${aiControls.is_proactive_enabled ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${aiControls.is_proactive_enabled ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <h4 className="font-black text-white text-sm mb-1 uppercase">Proactive Nudge</h4>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                            {aiControls.is_proactive_enabled ? 'Automatic follow-ups enabled' : 'Automatic nudges are disabled'}
                        </p>
                    </div>

                    {/* Response Delay */}
                    <div className="p-6 rounded-3xl border bg-slate-800/30 border-slate-700/30 transition-all">
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
                            max="30"
                            disabled={!isEditingAI}
                            value={aiControls.response_delay_mins}
                            onChange={(e) => setAiControls({ ...aiControls, response_delay_mins: parseInt(e.target.value) })}
                            className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${!isEditingAI ? 'cursor-not-allowed opacity-50' : ''}`}
                        />
                        <div className="flex justify-between mt-2 text-[8px] font-black text-slate-600 uppercase">
                            <span>Instant</span>
                            <span>30 Mins</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm glass-card rounded-[2rem] p-8 border border-slate-800 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-red-500/20">
                                <LogOut className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Sign Out?</h3>
                            <p className="text-slate-400 font-medium mb-8 text-sm">Are you sure you want to end your session?</p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-xl border border-slate-700 transition-all text-xs"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-500/20 transition-all text-xs"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
        </motion.div>
    );
}
