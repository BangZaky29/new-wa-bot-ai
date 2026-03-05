import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { ProfileInfo } from './ProfileInfo';
import { AIControls } from './AIControls';
import { AccountDanger } from './AccountDanger';

interface ProfileProps {
    user: any;
    status: any;
    onLogout: () => void;
    onNavigateAuth?: (view: 'login' | 'register') => void;
}

export function Profile({ user: initialUser, status, onLogout, onNavigateAuth }: ProfileProps) {
    const [user, setUser] = useState(initialUser);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <ProfileInfo
                user={user}
                status={status}
                onUpdateUser={setUser}
                onLogoutRequest={() => setShowLogoutConfirm(true)}
                onNavigateAuth={onNavigateAuth}
            />

            {user?.id && <AIControls userId={user.id} />}

            <AccountDanger onLogout={onLogout} />

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm glass-card rounded-[2rem] p-8 border border-slate-800 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-red-500/20">
                                <LogOut className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Sign Out?</h3>
                            <p className="text-slate-400 font-medium mb-8 text-sm">Are you sure you want to end your session?</p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-xl border border-slate-700 transition-all text-xs"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-500/20 transition-all text-xs"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
