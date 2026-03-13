import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Coins, Package, Image, Search, RefreshCw, ChevronDown, ChevronUp, Shield, CheckCircle2, ShieldAlert } from 'lucide-react';
import { moderatorApi } from '../../../core/services/moderator.api';
import type { UserInfo } from '../../../core/services/moderator.api';

export const UserList: React.FC = () => {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await moderatorApi.getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (user: UserInfo, action: string, params: any = {}) => {
        try {
            const res = await moderatorApi.executeCommand(action, { id: user.id, phone: user.phone }, params);
            if (res.success) {
                setNotification({ type: 'success', message: res.result });
                fetchUsers(); // Refresh data
            } else {
                setNotification({ type: 'error', message: res.result });
            }
        } catch (err: any) {
            setNotification({ type: 'error', message: err.message || 'Action failed' });
        }
        
        // Auto-clear notification
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = users.filter(u => {
        const q = search.toLowerCase();
        return (u.full_name?.toLowerCase().includes(q) ||
            u.phone?.includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q));
    });

    const getRoleBadge = (role: string) => {
        if (role === 'moderator') {
            return <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-violet-500/30">Moderator</span>;
        }
        return <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-slate-500/30">User</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-white uppercase">User Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{users.length} registered users</p>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 rounded-xl text-xs font-bold transition-all uppercase tracking-widest"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search users (name, phone, username, email)..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800/50 rounded-2xl text-white text-sm font-medium placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none transition-all backdrop-blur-sm"
                />
            </div>

            {/* User Cards */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20 text-slate-600">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-bold">No users found</p>
                    </div>
                ) : (
                    filteredUsers.map((user, idx) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-slate-900/40 border border-slate-800/40 rounded-2xl overflow-hidden hover:border-violet-500/20 transition-all backdrop-blur-sm"
                        >
                            {/* Main Row */}
                            <button
                                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                                className="w-full flex items-center gap-4 p-4 text-left"
                            >
                                {/* Avatar */}
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                                    user.role === 'moderator'
                                        ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/20'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                    {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-sm truncate uppercase tracking-wide">
                                            {user.full_name || user.username || 'N/A'}
                                        </span>
                                        {getRoleBadge(user.role)}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {user.phone}
                                        </span>
                                        {user.username && (
                                            <span className="text-[11px] text-slate-500">@{user.username}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="hidden md:flex items-center gap-4">
                                    <div className="text-center px-3 border-r border-slate-800">
                                        <div className="text-xs font-bold text-white tracking-widest leading-none">{user.token_balance ?? 0}</div>
                                        <div className="text-[9px] text-slate-600 uppercase tracking-widest mt-1 font-black">Token</div>
                                    </div>
                                    <div className="text-center px-3 border-r border-slate-800">
                                        <div className="text-xs font-bold text-white tracking-widest leading-none">{user.media_count ?? 0}</div>
                                        <div className="text-[9px] text-slate-600 uppercase tracking-widest mt-1 font-black">Media</div>
                                    </div>
                                    <div className="text-center px-3">
                                        <div className={`text-xs font-bold tracking-widest leading-none ${user.active_package ? 'text-violet-400' : 'text-slate-600'}`}>
                                            {user.active_package || '—'}
                                        </div>
                                        <div className="text-[9px] text-slate-600 uppercase tracking-widest mt-1 font-black">Paket</div>
                                    </div>
                                </div>

                                {/* Expand Icon */}
                                {expandedUser === user.id
                                    ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                                    : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                                }
                            </button>

                            {/* Expanded Detail */}
                            <AnimatePresence>
                                {expandedUser === user.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-5 pt-2 border-t border-slate-800/50 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/20">
                                            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                                                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-black">
                                                    <Mail className="w-3 h-3 text-violet-400" /> Email Address
                                                </div>
                                                <div className="text-xs text-slate-300 font-medium truncate">{user.email || '—'}</div>
                                            </div>
                                            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                                                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-black">
                                                    <Coins className="w-3 h-3 text-violet-400" /> Total Consumption
                                                </div>
                                                <div className="text-xs text-slate-300 font-medium">{user.total_used ?? 0} token</div>
                                            </div>
                                            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                                                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-black">
                                                    <Package className="w-3 h-3 text-violet-400" /> Subscription Plan
                                                </div>
                                                <div className={`text-xs font-medium ${user.active_package ? 'text-violet-400' : 'text-slate-500'}`}>
                                                    {user.active_package || 'None'}
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                                                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-black">
                                                    <Image className="w-3 h-3 text-violet-400" /> Cloud Media
                                                </div>
                                                <div className="text-xs text-slate-300 font-medium">{user.media_count ?? 0} files</div>
                                            </div>
                                        </div>

                                        {/* Admin Actions */}
                                        <div className="px-4 pb-5">
                                            <div className="p-4 bg-violet-600/5 border border-violet-500/10 rounded-2xl">
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-4 flex items-center gap-2">
                                                    <Shield className="w-3 h-3" /> Quick Actions
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <button
                                                        onClick={() => handleAction(user, 'add_tokens', { tokenAmount: 500 })}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-violet-600/20 border border-slate-700/50 hover:border-violet-500/30 rounded-xl text-[11px] font-bold text-slate-300 hover:text-violet-300 transition-all group"
                                                    >
                                                        <Coins className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                        +500 Tokens
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(user, 'delete_media', { mediaType: 'all' })}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-red-600/20 border border-slate-700/50 hover:border-red-500/30 rounded-xl text-[11px] font-bold text-slate-300 hover:text-red-300 transition-all group"
                                                    >
                                                        <Image className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                        Clear Media
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(user, 'activate_package', { packageName: 'basic' })}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-emerald-600/20 border border-slate-700/50 hover:border-emerald-500/30 rounded-xl text-[11px] font-bold text-slate-300 hover:text-emerald-300 transition-all group"
                                                    >
                                                        <Package className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                        Grant Basic
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-4 pb-4 bg-slate-900/20 flex justify-between items-center">
                                            <p className="text-[10px] text-slate-600 font-medium">
                                                UID: {user.id} • Registered: {new Date(user.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 font-bold text-sm ${
                            notification.type === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
