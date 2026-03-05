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
    const iconColor = type === 'danger' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : 'text-cyan-500';
    const bgColor = type === 'danger' ? 'bg-red-500/10' : type === 'warning' ? 'bg-yellow-500/10' : 'bg-cyan-500/10';
    const borderColor = type === 'danger' ? 'border-red-500/30' : type === 'warning' ? 'border-yellow-500/30' : 'border-cyan-500/30';
    const glowColor = type === 'danger' ? 'shadow-[0_0_30px_rgba(239,68,68,0.3)]' : type === 'warning' ? 'shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'shadow-[0_0_30px_rgba(6,182,212,0.3)]';
    const buttonBg = type === 'danger' ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400' : type === 'warning' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400' : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-sm rounded-[2.5rem] p-8 bg-slate-900 border border-slate-700 flex flex-col items-center overflow-hidden z-10"
                    >
                        {/* Glowing Orb Background */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className={`absolute top-0 w-32 h-32 ${bgColor} blur-[50px] rounded-full -mt-16`}
                        />

                        {/* Close button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center relative z-10 w-full">
                            {/* Icon Container */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1, bounce: 0.5 }}
                                className={`w-24 h-24 ${bgColor} ${glowColor} rounded-[2rem] mx-auto flex items-center justify-center mb-6 border ${borderColor} backdrop-blur-sm`}
                            >
                                {type === 'danger' ? (
                                    <Trash2 className={`w-12 h-12 ${iconColor}`} />
                                ) : type === 'warning' ? (
                                    <AlertTriangle className={`w-12 h-12 ${iconColor}`} />
                                ) : (
                                    <Shield className={`w-12 h-12 ${iconColor}`} />
                                )}
                            </motion.div>

                            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">{title}</h3>
                            <p className="text-slate-400 font-medium mb-8 text-[13px] leading-relaxed px-2">
                                {message}
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onCancel}
                                    className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-black rounded-2xl border border-slate-700 transition-colors text-xs tracking-widest"
                                >
                                    {cancelText.toUpperCase()}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onConfirm}
                                    className={`py-4 ${buttonBg} ${glowColor} text-white font-black rounded-2xl transition-all text-xs tracking-widest`}
                                >
                                    {confirmText.toUpperCase()}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
