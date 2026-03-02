import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2, Shield } from 'lucide-react';

interface CustomConfirmProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export function CustomConfirm({
    isOpen,
    title,
    message,
    confirmText = 'Proses',
    cancelText = 'Batal',
    type = 'danger',
    onConfirm,
    onCancel
}: CustomConfirmProps) {
    if (!isOpen) return null;

    const iconColor = type === 'danger' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : 'text-cyan-500';
    const bgColor = type === 'danger' ? 'bg-red-500/10' : type === 'warning' ? 'bg-yellow-500/10' : 'bg-cyan-500/10';
    const borderColor = type === 'danger' ? 'border-red-500/20' : type === 'warning' ? 'border-yellow-500/20' : 'border-cyan-500/20';
    const buttonColor = type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/40' : type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/40' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-sm glass-card rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative Blurs */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${bgColor} blur-[40px] rounded-full -mr-12 -mt-12`}></div>

                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <div className={`w-20 h-20 ${bgColor} rounded-[2rem] mx-auto flex items-center justify-center mb-6 border ${borderColor}`}>
                            {type === 'danger' ? (
                                <Trash2 className={`w-10 h-10 ${iconColor}`} />
                            ) : type === 'warning' ? (
                                <AlertTriangle className={`w-10 h-10 ${iconColor}`} />
                            ) : (
                                <Shield className={`w-10 h-10 ${iconColor}`} />
                            )}
                        </div>

                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{title}</h3>
                        <p className="text-slate-400 font-medium mb-8 text-sm leading-relaxed px-4">
                            {message}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={onCancel}
                                className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-2xl border border-slate-700 transition-all text-xs tracking-widest"
                            >
                                {cancelText.toUpperCase()}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`py-4 ${buttonColor} text-white font-black rounded-2xl shadow-lg transition-all text-xs tracking-widest`}
                            >
                                {confirmText.toUpperCase()}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
