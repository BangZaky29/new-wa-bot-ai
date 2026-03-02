import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger'
}: ConfirmModalProps) {
    const variantStyles = {
        danger: 'bg-red-500 hover:bg-red-600 shadow-red-900/20',
        warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-900/20',
        info: 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-900/20'
    };

    const iconColors = {
        danger: 'text-red-500 bg-red-500/10',
        warning: 'text-amber-500 bg-amber-500/10',
        info: 'text-cyan-500 bg-cyan-500/10'
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 md:p-10">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className={`p-5 rounded-3xl mb-6 ${iconColors[variant]}`}>
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    className={`w-full py-4 ${variantStyles[variant]} text-white rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95`}
                                >
                                    {confirmText}
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="w-full py-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-2xl text-sm font-bold transition-all active:scale-95"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
