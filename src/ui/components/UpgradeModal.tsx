import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Zap } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
    requiredPackage: 'Premium' | 'Pro';
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredPackage }: UpgradeModalProps) {
    const handleUpgradeClick = () => {
        onClose();
        // Redirect to billing section
        window.location.hash = '#billing';
        // If using a router, this should be a navigate('/billing')
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md glass-card rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl text-center relative overflow-hidden"
                    >
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full -mr-16 -mt-16"></div>

                        <div className="w-24 h-24 bg-yellow-500/10 rounded-[2rem] mx-auto flex items-center justify-center mb-8 border border-yellow-500/20 shadow-inner">
                            <Zap className="w-12 h-12 text-yellow-500 fill-yellow-500/20" />
                        </div>

                        <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">Feature Locked</h3>
                        <p className="text-slate-400 font-medium mb-2 text-sm leading-relaxed">
                            Fitur <span className="text-white font-bold">"{featureName}"</span> tidak tersedia di paket Anda saat ini.
                        </p>
                        <p className="text-slate-500 font-medium mb-10 text-[11px] uppercase tracking-widest">
                            Dibutuhkan paket <span className="text-yellow-500 font-black">{requiredPackage}</span> atau lebih tinggi.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleUpgradeClick}
                                className="w-full py-5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black rounded-2xl shadow-xl shadow-yellow-500/20 transition-all text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                UPGRADE SEKARANG <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-transparent hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 font-black rounded-2xl transition-all text-[10px] tracking-widest flex items-center justify-center gap-2"
                            >
                                <X className="w-3 h-3" /> NANTI SAJA
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-slate-600 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
