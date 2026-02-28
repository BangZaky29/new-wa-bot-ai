import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Trash2, Check, Pencil, Copy, Eye, EyeOff } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { ConfirmModal } from './ConfirmModal';
import type { ApiKeyItem } from '../hooks/useWhatsApp';

export const ApiKeyManager: React.FC = () => {
    const { getKeys, addKey, updateKey, removeKey, activateKey } = useWhatsApp();
    const [keys, setKeys] = useState<ApiKeyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingKey, setEditingKey] = useState<ApiKeyItem | null>(null);
    const [newKey, setNewKey] = useState({ name: '', value: '' });
    const [showKeyId, setShowKeyId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'err', text: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, key: ApiKeyItem | null }>({
        isOpen: false,
        key: null
    });

    const loadKeys = async () => {
        setLoading(true);
        const data = await getKeys();
        setKeys(data);
        setLoading(false);
    };

    useEffect(() => {
        loadKeys();
    }, []);

    const showMsg = (text: string, type: 'success' | 'err' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSave = async () => {
        if (!newKey.name || (!editingKey && !newKey.value)) return;

        let success;
        if (editingKey) {
            success = await updateKey(editingKey.id, newKey.name, newKey.value || undefined);
        } else {
            success = await addKey(newKey.name, newKey.value);
        }

        if (success) {
            showMsg(editingKey ? 'Key updated!' : 'Key added!');
            setIsAdding(false);
            setEditingKey(null);
            setNewKey({ name: '', value: '' });
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
        if (key.length <= 8) return '********';
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
                <button
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setEditingKey(null);
                        setNewKey({ name: '', value: '' });
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> {isAdding ? 'CANCEL' : 'ADD NEW KEY'}
                </button>
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
                        className="glass-card rounded-3xl p-6 border-slate-700/30 bg-slate-900/40"
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Key Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Production Key"
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
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
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
                    keys.map((k) => (
                        <motion.div
                            key={k.id}
                            layout
                            className={`glass-card rounded-[2rem] p-6 border transition-all cursor-default relative overflow-hidden group ${k.is_active ? 'border-cyan-500/50 bg-cyan-500/5 shadow-cyan-500/10' : 'border-slate-800/50 hover:border-slate-700'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${k.is_active ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-base leading-tight">{k.name}</h4>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                                            {k.is_active ? 'Currently Active' : 'Standby'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingKey(k);
                                            setNewKey({ name: k.name, value: '' });
                                            setIsAdding(true);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete({ isOpen: true, key: k })}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-950/40 rounded-2xl p-4 mb-5 border border-slate-800/30">
                                <div className="flex items-center justify-between">
                                    <code className="text-xs font-mono text-cyan-400 tracking-wider">
                                        {showKeyId === k.id ? k.key_value : maskKey(k.key_value)}
                                    </code>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowKeyId(showKeyId === k.id ? null : k.id)}
                                            className="p-1.5 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showKeyId === k.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(k.key_value)}
                                            className="p-1.5 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {!k.is_active && (
                                <button
                                    onClick={() => handleActivate(k.id)}
                                    className="w-full py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-slate-700/50 transition-all active:scale-[0.98]"
                                >
                                    Activate This Key
                                </button>
                            )}
                            {k.is_active && (
                                <div className="w-full py-3 bg-cyan-500/10 text-cyan-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-cyan-500/20 text-center flex items-center justify-center gap-2">
                                    <Check className="w-3 h-3" /> System Primary
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
    );
};
