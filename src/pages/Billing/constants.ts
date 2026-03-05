import { Package, Star, Crown } from 'lucide-react';

export const PACKAGE_META: Record<string, { icon: any; gradient: string; badge: string; border: string; glow: string }> = {
    basic: {
        icon: Package,
        gradient: 'from-emerald-500 to-green-600',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        border: 'border-emerald-500/30 hover:border-emerald-400/60',
        glow: 'shadow-emerald-500/10',
    },
    premium: {
        icon: Star,
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        border: 'border-blue-500/30 hover:border-blue-400/60',
        glow: 'shadow-blue-500/10',
    },
    pro: {
        icon: Crown,
        gradient: 'from-purple-500 to-pink-600',
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        border: 'border-purple-500/30 hover:border-purple-400/60',
        glow: 'shadow-purple-500/10',
    },
};
