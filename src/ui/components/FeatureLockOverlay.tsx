import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { SubscribeBadge } from './SubscribeBadge';

interface FeatureLockOverlayProps {
    featureName: string;
    requiredPackage: 'Premium' | 'Pro';
    description?: string;
    className?: string;
}

export function FeatureLockOverlay({
    featureName,
    requiredPackage,
    description,
    className = ""
}: FeatureLockOverlayProps) {
    return (
        <div className={`absolute inset-0 z-[100] backdrop-blur-md bg-slate-950/40 flex flex-col items-center justify-center p-8 text-center border border-yellow-500/20 rounded-[2rem] ${className}`}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mb-6 border border-yellow-500/20"
            >
                <Lock className="w-10 h-10 text-yellow-500" />
            </motion.div>

            <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-black text-white mb-2 uppercase tracking-tight"
            >
                {featureName} Locked
            </motion.h3>

            <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-sm font-medium mb-8 max-w-xs leading-relaxed"
            >
                {description || `Akses fitur ini hanya tersedia untuk pengguna paket`} <span className="text-yellow-500 font-bold">{requiredPackage}</span>.
            </motion.p>

            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <SubscribeBadge
                    featureName={featureName}
                    requiredPackage={requiredPackage}
                    className="scale-125"
                />
            </motion.div>
        </div>
    );
}
