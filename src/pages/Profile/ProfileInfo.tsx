import { useState } from 'react';
import { User, Mail, Phone, Shield, Settings, LogOut, Edit3, CheckCircle, AtSign, Save, X } from 'lucide-react';
import { apiService } from '../../core/services/api.service';

interface ProfileInfoProps {
    user: any;
    status: any;
    onUpdateUser: (user: any) => void;
    onLogoutRequest: () => void;
    onNavigateAuth?: (view: 'login' | 'register') => void;
}

export function ProfileInfo({ user, status, onUpdateUser, onLogoutRequest, onNavigateAuth }: ProfileInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || ''
    });

    const isDataEmpty = !user || (!user.phone && !user.username);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const res = await apiService.updateProfile({
                userId: user.id,
                ...editForm
            });
            if (res.success) {
                onUpdateUser(res.user);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* Profile Header Card */}
            <div className="glass-card rounded-[2.5rem] p-8 border border-slate-800/50 relative overflow-hidden text-slate-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 blur-[40px] rounded-full -ml-12 -mb-12"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-1 shadow-2xl shadow-purple-500/20">
                            <div className="w-full h-full bg-slate-900 rounded-[1.4rem] flex items-center justify-center overflow-hidden">
                                <User className="w-16 h-16 text-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        {isDataEmpty ? (
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Session Expired</h2>
                                <p className="text-slate-400 font-medium">Please login again to access your profile.</p>
                            </div>
                        ) : isEditing ? (
                            <div className="space-y-3 max-w-xs mx-auto md:mx-0">
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold"
                                    placeholder="Full Name"
                                />
                            </div>
                        ) : (
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                {user?.full_name || 'Anonymous Agent'}
                            </h2>
                        )}
                        {!isDataEmpty && (
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center mt-2">
                                <span className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <AtSign className="w-3 h-3 text-purple-500" /> {user?.username || 'no-username'}
                                </span>
                                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> {user?.role || 'User'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {isDataEmpty ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => onNavigateAuth?.('login')}
                                    className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    GO TO LOGIN
                                </button>
                                <button
                                    onClick={() => onNavigateAuth?.('register')}
                                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-xs tracking-widest transition-all border border-slate-700"
                                >
                                    REGISTER NEW ACCOUNT
                                </button>
                            </div>
                        ) : (
                            <>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdate}
                                            disabled={saving}
                                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-500 rounded-xl font-black text-[10px] tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <Save className="w-3 h-3" /> {saving ? 'SAVING...' : 'SAVE'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-xl font-black text-[10px] tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <X className="w-3 h-3" /> CANCEL
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-2xl font-black text-xs tracking-widest transition-all flex items-center gap-3"
                                    >
                                        <Edit3 className="w-4 h-4" /> EDIT PROFILE
                                    </button>
                                )}
                                <button
                                    onClick={onLogoutRequest}
                                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-2xl font-black text-xs tracking-widest transition-all flex items-center gap-3"
                                >
                                    <LogOut className="w-4 h-4" /> LOGOUT
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-200">
                <div className="glass-card rounded-[2rem] p-6 border border-slate-800/50 space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                        Account Details
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</p>
                                <p className="font-bold text-white">+{user?.phone || 'Not Linked'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700/30 rounded-lg px-2 py-1 text-xs text-white"
                                    />
                                ) : (
                                    <p className="font-bold text-white">{user?.email || 'not_set@example.com'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[2rem] p-6 border border-slate-800/50 space-y-6 text-slate-200">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        System Status
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auth Provider</p>
                                    <p className="font-bold text-white">Supabase Auth</p>
                                </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WA Session</p>
                                    <p className={`font-bold ${status?.isConnected ? 'text-cyan-400' : 'text-red-500'}`}>
                                        {status?.isConnected ? 'ACTIVE' : 'DISCONNECTED'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
