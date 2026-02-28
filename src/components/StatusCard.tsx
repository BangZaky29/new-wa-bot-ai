import { useState } from 'react';
import { Settings, Power, XCircle, Cpu } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import type { ConnectionStatus } from '../types';

interface StatusCardProps {
    status: ConnectionStatus;
    initializing: boolean;
    onInit: () => void;
    onLogout: () => void;
    sessionId: string;
}

export function StatusCard({ status, initializing, onInit, onLogout, sessionId }: StatusCardProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    return (
        <div className="glass-card rounded-[2rem] p-8">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> BOT INSTANCE STATUS
            </h3>

            <div className="flex flex-col items-center mb-8">
                <div className="relative mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${status.isConnected ? 'border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'border-slate-700'}`}>
                        {status.isConnected ? (
                            <Power className="w-10 h-10 text-green-500" />
                        ) : (
                            <XCircle className="w-10 h-10 text-slate-600" />
                        )}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white capitalize">{status.status}</h2>
                <p className="text-slate-500 text-sm mt-1">{sessionId}</p>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                    <span className="text-slate-400 text-sm font-medium">Gateway</span>
                    <span className="text-cyan-400 text-sm font-bold">ONLINE</span>
                </div>
                {status.phoneNumber && (
                    <div className="flex justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                        <span className="text-slate-400 text-sm font-medium">Attached No</span>
                        <span className="text-white text-sm font-bold">+{status.phoneNumber}</span>
                    </div>
                )}
            </div>

            {!status.isConnected && !status.hasQR && (
                <button
                    onClick={onInit}
                    disabled={initializing}
                    className="w-full mt-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                    <Cpu className={`w-5 h-5 group-hover:rotate-12 transition-transform ${initializing ? 'animate-spin' : ''}`} />
                    {initializing ? 'BOOTING...' : 'INITIALIZE SYSTEM'}
                </button>
            )}

            {status.isConnected && (
                <button
                    onClick={() => setIsConfirmOpen(true)}
                    className="w-full mt-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
                >
                    <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    SHUTDOWN BOT
                </button>
            )}

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Matikan Bot?"
                message="Anda yakin ingin mematikan instance bot ini? Sesi WhatsApp akan terputus dan AI tidak akan merespon pesan lagi."
                onConfirm={() => {
                    onLogout();
                    setIsConfirmOpen(false);
                }}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Ya, Matikan"
                variant="danger"
            />
        </div>
    );
}
