import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Sparkles, Plus, Trash2, Check, Pencil } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { ConfirmModal } from './ConfirmModal';
import type { PromptItem } from '../hooks/useWhatsApp';

export const PromptEditor: React.FC = () => {
    const { getPrompts, savePrompt, updatePrompt, activatePrompt, removePrompt } = useWhatsApp();
    const [prompts, setPrompts] = useState<PromptItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
    const [newPrompt, setNewPrompt] = useState({ name: '', content: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'err', text: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, prompt: PromptItem | null }>({
        isOpen: false,
        prompt: null
    });

    const loadPrompts = async () => {
        setLoading(true);
        const data = await getPrompts();
        setPrompts(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPrompts();
    }, []);

    const handleSave = async () => {
        if (!newPrompt.name || !newPrompt.content) return;

        let success = false;
        if (editingPrompt) {
            success = await updatePrompt(editingPrompt.id, newPrompt.name, newPrompt.content);
        } else {
            success = await savePrompt(newPrompt.name, newPrompt.content);
        }

        if (success) {
            setMessage({ type: 'success', text: editingPrompt ? 'Persona berhasil diperbarui!' : 'Persona baru berhasil disimpan!' });
            setNewPrompt({ name: '', content: '' });
            setIsAdding(false);
            setEditingPrompt(null);
            loadPrompts();
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const startEdit = (p: PromptItem) => {
        setEditingPrompt(p);
        setNewPrompt({ name: p.name, content: p.content });
        setIsAdding(true);
    };

    const handleActivate = async (id: string) => {
        const success = await activatePrompt(id);
        if (success) {
            setMessage({ type: 'success', text: 'Persona berhasil diaktifkan!' });
            loadPrompts();
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <RefreshCcw className="w-8 h-8 text-cyan-500 animate-spin" />
                <p className="text-slate-400 font-medium">Loading persona library...</p>
            </div>
        );
    } const handleDelete = async () => {
        if (!confirmDelete.prompt) return;
        const success = await removePrompt(confirmDelete.prompt.id);
        if (success) {
            loadPrompts();
            setConfirmDelete({ isOpen: false, prompt: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">AI Persona Library</h2>
                        <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Daftar kepribadian asisten AI Anda</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadPrompts}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                        title="Refresh Library"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            if (isAdding) {
                                setIsAdding(false);
                                setEditingPrompt(null);
                                setNewPrompt({ name: '', content: '' });
                            } else {
                                setIsAdding(true);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-900/20"
                    >
                        <Plus className={`w-4 h-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                        {editingPrompt ? 'Cancel Edit' : 'New Persona'}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card rounded-2xl border border-purple-500/30 overflow-hidden"
                    >
                        <div className="p-6 space-y-4 bg-purple-500/5">
                            <input
                                type="text"
                                placeholder="Nama Persona (e.g. Bestie Introvert)"
                                value={newPrompt.name}
                                onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            />
                            <textarea
                                placeholder="System Prompt / Instruksi..."
                                value={newPrompt.content}
                                onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 font-mono"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all p-3 shadow-lg shadow-green-900/20"
                                >
                                    {editingPrompt ? 'Update Persona' : 'Save Persona'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingPrompt(null);
                                        setNewPrompt({ name: '', content: '' });
                                    }}
                                    className="px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-center font-bold text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                >
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {prompts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 glass-card rounded-2xl border border-slate-800">
                        <p className="text-sm">Belum ada persona yang tersimpan.</p>
                    </div>
                ) : (
                    prompts.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => !p.is_active && handleActivate(p.id)}
                            className={`glass-card rounded-2xl border transition-all cursor-pointer group ${p.is_active ? 'border-green-500/50 bg-green-500/5 ring-1 ring-green-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                        >
                            <div className="p-6 flex items-center justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${p.is_active ? 'border-green-500 bg-green-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                            {p.is_active && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <h4 className="text-white font-bold">{p.name}</h4>
                                    </div>
                                    <p className="text-slate-400 text-xs line-clamp-2 italic">"{p.content}"</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEdit(p);
                                        }}
                                        className="p-2 text-slate-500 hover:text-cyan-500 transition-colors"
                                        title="Edit Persona"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!p.is_active) {
                                                setConfirmDelete({ isOpen: true, prompt: p });
                                            }
                                        }}
                                        disabled={p.is_active}
                                        className="p-2 text-slate-600 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Hapus Persona"
                message={`Anda yakin ingin menghapus persona AI "${confirmDelete.prompt?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, prompt: null })}
                confirmText="Ya, Hapus"
                variant="danger"
            />
        </div>
    );
};
