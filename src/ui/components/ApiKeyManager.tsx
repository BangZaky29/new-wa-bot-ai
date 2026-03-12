import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Check, Pencil, Copy, Eye, EyeOff } from 'lucide-react';
import { useWhatsApp } from '../../core/hooks/useWhatsApp';
import { getSessionId } from '../../core/hooks/helpers';
import { ConfirmModal } from './ConfirmModal';
import { SubscribeBadge } from './SubscribeBadge';
import { FeatureLockOverlay } from './FeatureLockOverlay';
import { paymentApi } from '../../core/services/payment.api';
import type { ApiKeyItem } from '../../core/hooks/useWhatsApp';

export const ApiKeyManager: React.FC = () => {
    const { getKeys, addKey, updateKey, removeKey, activateKey } = useWhatsApp();
    const [keys, setKeys] = useState<ApiKeyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingKey, setEditingKey] = useState<ApiKeyItem | null>(null);
    const [newKey, setNewKey] = useState({ name: '', value: '', model: 'gemini-2.5-flash', version: 'v1beta' });
    const [showKeyId, setShowKeyId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'err', text: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, key: ApiKeyItem | null }>({
        isOpen: false,
        key: null
    });
    const [userFeatures, setUserFeatures] = useState<any>(null);

    // Get the User ID from first active key OR we might need it as a prop
    // For now let's use the X-Session-Id logic if possible, 
    // but ApiKeyManager should ideally know who the user is.
    // Looking at other files, we usually have access to userId.
    // Since this is inside Profile, it's passed down or available via session.

    const loadKeys = async () => {
        setLoading(true);
        const data = await getKeys();
        setKeys(data);
        setLoading(false);
    };

    useEffect(() => {
        loadKeys();
        fetchUserFeatures();
    }, []);

    const fetchUserFeatures = async () => {
        const userId = getSessionId();
        if (!userId) return;

        try {
            const res = await paymentApi.getUserFeatures(userId);
            if (res.success) {
                setUserFeatures(res.features);
            }
        } catch (err) {
            console.error('Failed to fetch features:', err);
        }
    };

    const showMsg = (text: string, type: 'success' | 'err' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSave = async () => {
        if (!newKey.name || (!editingKey && !newKey.value)) return;

        let success;
        if (editingKey) {
            success = await updateKey(editingKey.id, newKey.name, newKey.value || undefined, newKey.model, newKey.version);
        } else {
            success = await addKey(newKey.name, newKey.value, newKey.model, newKey.version);
        }

        if (success) {
            showMsg(editingKey ? 'Key updated!' : 'Key added!');
            setIsAdding(false);
            setEditingKey(null);
            setNewKey({ name: '', value: '', model: 'gemini-2.5-flash', version: 'v1beta' });
            loadKeys();
        } else {
            showMsg('Failed to save key', 'err');
        }
    };

    const handleActivate = async (id: string) => {
        const success = await activateKey(id);
        if (success) {
            showMsg('Active key updated!');
            loadKeys();
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete.key) return;
        const success = await removeKey(confirmDelete.key.id);
        if (success) {
            showMsg('Key deleted!');
            loadKeys();
            setConfirmDelete({ isOpen: false, key: null });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showMsg('Copied to clipboard!');
    };

    const maskKey = (key: string) => {
        if (!key) return '';
        if (key.length <= 12) return '********';
        return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    };

    if (loading && keys.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium text-sm">Loading API keys...</p>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-[2rem]">
            {userFeatures && userFeatures.max_api_keys === 0 && (
                <FeatureLockOverlay
                    featureName="BYOK (Bring Your Own Key)"
                    requiredPackage="Pro"
                    description="Gunakan API Key Gemini Anda sendiri untuk kontrol penuh dan biaya lebih hemat."
                />
            )}
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h3 className="text-white font-black text-xl flex items-center gap-3">
                            <Key className="w-6 h-6 text-cyan-500" /> GEMINI API KEYS
                        </h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                            KELOLA KUNCI AKSES KECERDASAN BUATAN ANDA
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {userFeatures && (keys.length >= userFeatures.max_api_keys) && !userFeatures.log_monitor_enabled && (
                            <SubscribeBadge
                                featureName={userFeatures.max_api_keys === 0 ? "API Key Access" : "Extra API Keys"}
                                requiredPackage={userFeatures.max_api_keys === 0 ? "Premium" : "Pro"}
                            />
                        )}
                        {/* 
                            NOTE: ADD NEW KEY is hidden to maintain template consistency. 
                            Users are provided with template keys to edit.
                        */}
                    </div>
                </div>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`p-4 rounded-2xl text-xs font-bold border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                            {message.text}
                        </motion.div>
                    )}

                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass-card rounded-3xl p-6 border-slate-700/30 bg-slate-900/40 relative overflow-visible"
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Key Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. AI-SAYA"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-medium"
                                            value={newKey.name}
                                            onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Key Value</label>
                                        <input
                                            type="text"
                                            placeholder={editingKey ? "Leave empty to keep current" : "AIza..."}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-medium"
                                            value={newKey.value}
                                            onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Model Name</label>
                                        <input
                                            type="text"
                                            placeholder="gemini-2.5-flash"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-medium"
                                            value={newKey.model}
                                            onChange={(e) => setNewKey({ ...newKey, model: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">API Version</label>
                                        <input
                                            type="text"
                                            placeholder="v1beta (optional)"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-medium"
                                            value={newKey.version}
                                            onChange={(e) => setNewKey({ ...newKey, version: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <Check className="w-5 h-5" />
                                    {editingKey ? 'UPDATE API KEY' : 'SAVE NEW API KEY'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {keys.length === 0 ? (
                        <div className="md:col-span-2 text-center py-10 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                            <Key className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-600 text-sm font-medium">No API keys found. Please add one to use the AI.</p>
                        </div>
                    ) : (
                        keys.map((k, index) => (
                            <motion.div
                                key={k.id || `key-${index}`}
                                layout
                                className={`glass-card rounded-[2.5rem] p-7 border transition-all cursor-default relative overflow-hidden group ${k.is_active ? 'border-cyan-500/40 bg-[#0a1120] shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-slate-800/50 hover:border-slate-700 bg-slate-900/20'}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${k.is_active ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-800/80 text-slate-500'}`}>
                                            <Key className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-lg tracking-tight leading-tight uppercase">{k.name}</h4>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${k.is_active ? 'text-cyan-500' : 'text-slate-600'}`}>
                                                {k.is_active ? 'Currently Active' : 'Standby'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <button
                                            onClick={() => {
                                                setEditingKey(k);
                                                setNewKey({ name: k.name, value: '', model: k.model_name, version: k.api_version });
                                                setIsAdding(true);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all border border-transparent hover:border-slate-700"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        {/* Delete button removed to keep template keys */}
                                    </div>
                                </div>

                                <div className="bg-[#050914] rounded-2xl p-5 mb-6 border border-slate-800/50 group-hover:border-cyan-500/20 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <code className="text-sm font-mono text-cyan-400/90 tracking-[0.15em] font-bold">
                                            {showKeyId === k.id ? k.key_value : maskKey(k.key_value)}
                                        </code>
                                        <div className="flex gap-2.5">
                                            <button
                                                onClick={() => setShowKeyId(showKeyId === k.id ? null : k.id)}
                                                className="p-1.5 text-slate-600 hover:text-cyan-400 transition-colors"
                                            >
                                                {showKeyId === k.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(k.key_value)}
                                                className="p-1.5 text-slate-600 hover:text-cyan-400 transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <div className="flex gap-3 text-slate-600">
                                            <span>Model: <span className="text-slate-400">{k.model_name}</span></span>
                                            <span>v: <span className="text-slate-400">{k.api_version || '-'}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {!k.is_active && (
                                    <button
                                        onClick={() => handleActivate(k.id)}
                                        className="w-full py-4 bg-slate-800/40 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all active:scale-[0.98]"
                                    >
                                        Activate This Key
                                    </button>
                                )}
                                {k.is_active && (
                                    <div className="w-full py-4 bg-cyan-500/5 text-cyan-500 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl border border-cyan-500/20 text-center flex items-center justify-center gap-3">
                                        <Check className="w-4 h-4" /> SYSTEM PRIMARY
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>

                <ConfirmModal
                    isOpen={confirmDelete.isOpen}
                    title="Hapus API Key"
                    message={`Anda yakin ingin menghapus "${confirmDelete.key?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDelete({ isOpen: false, key: null })}
                    confirmText="Ya, Hapus"
                    variant="danger"
                />
            </div>
        </div>
    );
};
