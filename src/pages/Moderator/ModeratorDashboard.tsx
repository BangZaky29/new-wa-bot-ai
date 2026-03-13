import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, History, BarChart3, Shield, Terminal, ArrowLeft } from 'lucide-react';
import { UserList } from './components/UserList';
import { CommandLog } from './components/CommandLog';
import { SystemStats } from './components/SystemStats';

interface ModeratorDashboardProps {
    onBack?: () => void;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'stats'>('users');

    const tabs = [
        { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
        { id: 'logs', label: 'Command Logs', icon: <History className="w-5 h-5" /> },
        { id: 'stats', label: 'System Stats', icon: <BarChart3 className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-200 font-sans selection:bg-violet-500/30">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button 
                                onClick={onBack}
                                className="p-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 uppercase">
                                Moderator Panel
                                <span className="text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/30 tracking-widest">
                                    SECURE ACCESS
                                </span>
                            </h1>
                            <p className="text-slate-400 text-sm font-medium tracking-wide">
                                System administration & real-time monitoring
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                            <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">Admin Session Active</span>
                        </div>
                    </div>
                </header>

                {/* Sub-header / Stats Overview could go here */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Navigation Sidebar */}
                    <aside className="lg:col-span-3 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-tab-indicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                    />
                                )}
                            </button>
                        ))}

                        <div className="mt-8 p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Terminal className="w-4 h-4 text-violet-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Logs</span>
                            </div>
                            <div className="space-y-3">
                                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                    Moderator interceptor: Active
                                </div>
                                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                    Audit logging: Enabled
                                </div>
                                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-violet-500"></span>
                                    Gemini Command Parser: Online
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="lg:col-span-9">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {activeTab === 'users' && <UserList />}
                            {activeTab === 'logs' && <CommandLog />}
                            {activeTab === 'stats' && <SystemStats />}
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ModeratorDashboard;
