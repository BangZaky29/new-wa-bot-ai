import { CheckCircle2, QrCode } from 'lucide-react';
import type { ConnectionStatus } from '../types';

interface QRCodeSectionProps {
    status: ConnectionStatus;
}

export function QRCodeSection({ status }: QRCodeSectionProps) {
    if (status.hasQR) {
        return (
            <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center">
                <div className="bg-white p-6 rounded-[2rem] shadow-2xl mb-8 relative">
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-[2rem] animate-pulse-slow"></div>
                    <img src={status.qrImage} alt="QR Code" className="w-64 h-64 relative z-10" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">SCAN TO LINK BOT</h2>
                <p className="text-slate-400 text-center max-w-md">
                    Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device.
                    Wait for the sync to complete.
                </p>
            </div>
        );
    }

    if (status.isConnected) {
        return (
            <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 text-center uppercase tracking-tight">AI Engine Loaded</h2>
                <p className="text-slate-400 text-center max-w-lg mb-8">
                    The AI bot is now listening for incoming messages on +{status.phoneNumber}.
                    Automation rules are active.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <div className="p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-widest">Uptime</span>
                        <span className="text-lg font-bold text-white">0h 0m</span>
                    </div>
                    <div className="p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-widest">Efficiency</span>
                        <span className="text-lg font-bold text-white">99.9%</span>
                    </div>
                    <div className="p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-widest">Memory</span>
                        <span className="text-lg font-bold text-white">12.5MB</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50">
                <QrCode className="w-16 h-16 text-slate-600" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 text-center">SYSTEM IDLE</h2>
            <p className="text-slate-500 text-center max-w-md">
                Please initialize the system using the sidebar button to generate a connection QR code.
            </p>
        </div>
    );
}
