import { useState } from 'react';
import { Zap } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';

interface SubscribeBadgeProps {
    featureName: string;
    requiredPackage: 'Premium' | 'Pro';
    className?: string;
}

export function SubscribeBadge({ featureName, requiredPackage, className = "" }: SubscribeBadgeProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl transition-all group pointer-events-auto ${className}`}
            >
                <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500/20 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black text-yellow-500 tracking-[0.15em] uppercase">SUBSCRIBE</span>
            </button>

            <UpgradeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                featureName={featureName}
                requiredPackage={requiredPackage}
            />
        </>
    );
}
