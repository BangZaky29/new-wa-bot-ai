import { useState } from 'react';
import { Bot, Shield, LogOut } from 'lucide-react';
import { CustomConfirm } from '../../ui/components/CustomConfirm';
import { useWhatsApp } from '../../core/hooks/useWhatsApp';

interface AccountDangerProps {
    onLogout: () => void;
}

export function AccountDanger({ onLogout }: AccountDangerProps) {
    const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState(false);
    const [isFinalWipeConfirm, setIsFinalWipeConfirm] = useState(false);
    const [wiping, setWiping] = useState(false);
    const { wipeAccountData } = useWhatsApp();

    return (
        <div className="glass-card rounded-[2rem] p-8 border border-red-500/20 bg-red-500/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full -mr-16 -mt-16"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <Shield className="w-6 h-6 text-red-500" />
                        Danger Zone
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tight">Kawasan Berbahaya: Tindakan ini tidak dapat dibatalkan</p>
                </div>
            </div>

            <div className="p-6 rounded-3xl border border-red-500/20 bg-slate-900/40 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                        <Bot className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-black text-white text-sm uppercase mb-1">Hapus Semua Data Akun</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed max-w-lg">
                            PERINGATAN KERAS: Semua Riwayat Chat, Daftar Kontak, Langganan Payment, Saldo Token, Prompt, dan API Key akan dihapus PERMANEN dari database. Anda tidak akan bisa mengembalikan data ini.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsWipeConfirmOpen(true)}
                        disabled={wiping}
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-lg shadow-red-900/40 flex items-center gap-3 whitespace-nowrap"
                    >
                        <LogOut className="w-4 h-4" /> {wiping ? 'MENGHAPUS...' : 'HAPUS AKUN'}
                    </button>
                </div>
            </div>

            {/* Account Wipe Confirmation Modals */}
            <CustomConfirm
                isOpen={isWipeConfirmOpen}
                title="Hapus Semua Data?"
                message="⚠️ PERINGATAN KERAS! Anda akan menghapus SELURUH data Anda (History, Saldo Token, Pembayaran, Kontak, API Key). Lanjutkan ke tahap konfirmasi terakhir?"
                confirmText="Lanjutkan"
                cancelText="Batal"
                onConfirm={() => {
                    setIsWipeConfirmOpen(false);
                    setIsFinalWipeConfirm(true);
                }}
                onCancel={() => setIsWipeConfirmOpen(false)}
            />

            <CustomConfirm
                isOpen={isFinalWipeConfirm}
                title="Konfirmasi Terakhir"
                message="🛑 STOP! Apakah Anda BENAR-BENAR yakin? Seluruh data akan dihapus permanen dan tidak bisa dikembalikan lagi. Sesi WhatsApp juga akan diputus."
                confirmText="HAPUS SEMUA SEKARANG"
                cancelText="BATALKAN"
                onConfirm={async () => {
                    setIsFinalWipeConfirm(false);
                    setWiping(true);
                    try {
                        const success = await wipeAccountData();
                        if (success) {
                            alert("✅ Berhasil! Semua data Anda telah dihapus.");
                            onLogout();
                        } else {
                            alert("❌ Gagal menghapus data. Cek koneksi.");
                        }
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setWiping(false);
                    }
                }}
                onCancel={() => setIsFinalWipeConfirm(false)}
            />
        </div>
    );
}
