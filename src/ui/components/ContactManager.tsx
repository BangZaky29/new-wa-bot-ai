import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Shield, ShieldAlert, History, UserPlus } from 'lucide-react';
import { useWhatsApp } from '../../core/hooks/useWhatsApp';
import { ConfirmModal } from './ConfirmModal';
import type { ContactItem, BlockedAttempt } from '../../core/hooks/useWhatsApp';

export function ContactManager() {
    const {
        getContacts, removeContact, updateTargetMode,
        getBlockedAttempts, whitelistBlocked
    } = useWhatsApp();
    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const [blockedAttempts, setBlockedAttempts] = useState<BlockedAttempt[]>([]);
    const [mode, setMode] = useState<'all' | 'specific'>('all');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'allowed' | 'blocked'>('allowed');
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, contact: ContactItem | null }>({
        isOpen: false,
        contact: null
    });

    const loadData = async () => {
        setLoading(true);
        const [contactData, blockedData] = await Promise.all([
            getContacts(),
            getBlockedAttempts()
        ]);
        setContacts(contactData.contacts);
        setMode(contactData.mode);
        setBlockedAttempts(blockedData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleModeChange = async (newMode: 'all' | 'specific') => {
        const success = await updateTargetMode(newMode);
        if (success) {
            setMode(newMode);
            loadData();
        }
    };

    const handleWhitelistBlocked = async (attempt: BlockedAttempt) => {
        const success = await whitelistBlocked(attempt.jid, attempt.push_name);
        if (success) {
            loadData();
        }
    };

    const handleDeleteContact = async () => {
        if (!confirmDelete.contact) return;
        const success = await removeContact(confirmDelete.contact.jid);
        if (success) {
            loadData();
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
                        <p className="text-slate-400 text-[10px] leading-tight max-w-[250px]">
                            Tentukan siapa yang bisa chat dengan AI.
                            {mode === 'all' && <span className="text-green-400 block mt-1">✓ AI akan membalas semua orang yang chat.</span>}
                            {mode === 'specific' && <span className="text-amber-400 block mt-1">⚠️ Hanya nomor di "Daftar Kontak Terpilih" yang akan dibalas AI.</span>}
                        </p>
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
                    <div className="border-b border-slate-800 bg-slate-900/30">
                        <div className="flex p-1 gap-2 m-2 bg-slate-800/50 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('allowed')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'allowed' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <Users className="w-4 h-4" />
                                Daftar Putih
                            </button>
                            <button
                                onClick={() => setActiveTab('blocked')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'blocked' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <History className="w-4 h-4" />
                                Baru Masuk (Blocked)
                                {blockedAttempts.length > 0 && (
                                    <span className="bg-white text-red-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                                        {blockedAttempts.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="px-6 py-3 border-t border-slate-800 bg-blue-500/5">
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                {activeTab === 'allowed'
                                    ? "💡 Ini adalah daftar orang yang diizinkan chat dengan AI. Anda bisa menghapus mereka kapan saja."
                                    : "💡 Nomor di bawah ini baru saja mencoba chat tapi diblokir. Klik 'Izinkan' untuk memasukkan mereka ke Daftar Putih."}
                            </p>
                        </div>

                        <div className="p-4 px-6 flex items-center justify-between border-t border-slate-800">
                            <div className="flex items-center gap-3">
                                {activeTab === 'allowed' ? (
                                    <>
                                        <Users className="w-5 h-5 text-cyan-500" />
                                        <h4 className="text-white font-bold text-sm">Daftar Kontak Terpilih</h4>
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert className="w-5 h-5 text-red-500" />
                                        <h4 className="text-white font-bold text-sm">Kontak Baru yang Diblokir</h4>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-0">
                        <AnimatePresence mode="wait">
                            {activeTab === 'allowed' ? (
                                <motion.div
                                    key="allowed-tab"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="divide-y divide-slate-800/50"
                                >

                                    {contacts.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">
                                            <p className="text-sm">Belum ada kontak yang diizinkan.</p>
                                        </div>
                                    ) : (
                                        contacts.map((contact) => (
                                            <div key={contact.jid} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition-colors text-sm font-bold">
                                                        {contact.push_name?.charAt(0) || contact.jid.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">{contact.push_name || 'Anonymous'}</p>
                                                        <p className="text-slate-500 text-[10px] font-mono">{contact.jid.split('@')[0]}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
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
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="blocked-tab"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="divide-y divide-slate-800/50"
                                >
                                    {blockedAttempts.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">
                                            <p className="text-sm">Tidak ada chat otomatis yang diblokir baru-baru ini.</p>
                                        </div>
                                    ) : (
                                        blockedAttempts.map((attempt) => (
                                            <div key={attempt.jid} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-sm font-bold">
                                                        {attempt.push_name?.charAt(0) || attempt.jid.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">{attempt.push_name || 'Unknown'}</p>
                                                        <p className="text-slate-500 text-[10px] font-mono">{attempt.jid.split('@')[0]}</p>
                                                        <p className="text-slate-600 text-[9px] mt-1 italic">Diakses pada: {new Date(attempt.attempted_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleWhitelistBlocked(attempt)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-green-600/20"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    Izinkan
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )
            }

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Hapus Kontak"
                message={`Anda yakin ingin menghapus "${confirmDelete.contact?.push_name || confirmDelete.contact?.jid}" dari daftar whitelist?`}
                onConfirm={handleDeleteContact}
                onCancel={() => setConfirmDelete({ isOpen: false, contact: null })}
                confirmText="Ya, Hapus"
                variant="danger"
            />
        </div >
    );
}
