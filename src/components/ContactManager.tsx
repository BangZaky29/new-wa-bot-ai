import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Shield, ShieldAlert, Check, X, Pencil, Plus } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { ConfirmModal } from './ConfirmModal';
import type { ContactItem } from '../hooks/useWhatsApp';

export function ContactManager() {
    const { getContacts, addContact, updateContact, removeContact, updateTargetMode } = useWhatsApp();
    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const [mode, setMode] = useState<'all' | 'specific'>('all');
    const [loading, setLoading] = useState(true);
    const [newContact, setNewContact] = useState({ jid: '', name: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [editingJid, setEditingJid] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, contact: ContactItem | null }>({
        isOpen: false,
        contact: null
    });

    const loadContacts = async () => {
        setLoading(true);
        const data = await getContacts();
        setContacts(data.contacts);
        setMode(data.mode);
        setLoading(false);
    };

    useEffect(() => {
        loadContacts();
    }, []);

    const handleModeChange = async (newMode: 'all' | 'specific') => {
        const success = await updateTargetMode(newMode);
        if (success) setMode(newMode);
    };

    const handleAddContact = async () => {
        if (!newContact.jid) return;

        // Normalize the new JID early for comparison
        let cleanJid = newContact.jid.replace(/\D/g, '');
        if (cleanJid.startsWith('08')) {
            cleanJid = '628' + cleanJid.substring(2);
        }
        if (!cleanJid.endsWith('@s.whatsapp.net')) {
            cleanJid += '@s.whatsapp.net';
        }

        let success = false;
        if (editingJid) {
            // If the number (JID) hasn't changed, just update the name
            if (cleanJid === editingJid) {
                success = await updateContact(editingJid, newContact.name);
            } else {
                // If it changed, we must delete the old one and add the new one (since JID is the PK/Identity)
                await removeContact(editingJid);
                success = await addContact(cleanJid, newContact.name);
            }
        } else {
            success = await addContact(cleanJid, newContact.name);
        }

        if (success) {
            setNewContact({ jid: '', name: '' });
            setIsAdding(false);
            setEditingJid(null);
            loadContacts();
        }
    };

    const startEdit = (c: ContactItem) => {
        setEditingJid(c.jid);
        setNewContact({ jid: c.jid.split('@')[0], name: c.push_name || '' });
        setIsAdding(true);
    };

    const handleDeleteContact = async () => {
        if (!confirmDelete.contact) return;
        const success = await removeContact(confirmDelete.contact.jid);
        if (success) {
            loadContacts();
            setConfirmDelete({ isOpen: false, contact: null });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${mode === 'all' ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                        {mode === 'all' ? <Shield className="w-6 h-6 text-green-500" /> : <ShieldAlert className="w-6 h-6 text-amber-500" />}
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Target Mode</h4>
                        <p className="text-slate-400 text-xs">Tentukan siapa yang bisa chat dengan AI</p>
                    </div>
                </div>

                <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
                    <button
                        onClick={() => handleModeChange('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'all' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Semua Kontak
                    </button>
                    <button
                        onClick={() => handleModeChange('specific')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'specific' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Kontak Terpilih
                    </button>
                </div>
            </div>

            {mode === 'specific' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl border border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-cyan-500" />
                            <h4 className="text-white font-bold">Daftar Kontak Terpilih</h4>
                        </div>
                        {!isAdding && (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-900/20"
                            >
                                <Plus className="w-4 h-4" />
                                Add Number
                            </button>
                        )}
                    </div>

                    <div className="p-0">
                        <AnimatePresence>
                            {isAdding && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-4 bg-slate-800/50 border-b border-slate-800"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Nama (opsional)"
                                            value={newContact.name}
                                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nomor (e.g. 08xxx atau 628xxx)"
                                            value={newContact.jid}
                                            onChange={(e) => setNewContact({ ...newContact, jid: e.target.value })}
                                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddContact}
                                                className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all p-2 flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4" /> {editingJid ? 'Update' : 'Simpan'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAdding(false);
                                                    setEditingJid(null);
                                                    setNewContact({ jid: '', name: '' });
                                                }}
                                                className="w-12 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all p-2 flex items-center justify-center"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="divide-y divide-slate-800/50">
                            {contacts.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <p className="text-sm">Belum ada kontak yang diizinkan.</p>
                                </div>
                            ) : (
                                contacts.map((contact) => (
                                    <div key={contact.jid} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition-colors">
                                                {contact.push_name?.charAt(0) || contact.jid.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">{contact.push_name || 'Anonymous'}</p>
                                                <p className="text-slate-500 text-[10px] font-mono">{contact.jid.split('@')[0]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => startEdit(contact)}
                                                className="p-2 text-slate-500 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-all"
                                                title="Edit Contact"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete({ isOpen: true, contact: contact })}
                                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Contact"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Hapus Kontak"
                message={`Anda yakin ingin menghapus "${confirmDelete.contact?.push_name || confirmDelete.contact?.jid}" dari daftar whitelist?`}
                onConfirm={handleDeleteContact}
                onCancel={() => setConfirmDelete({ isOpen: false, contact: null })}
                confirmText="Ya, Hapus"
                variant="danger"
            />
        </div>
    );
}
