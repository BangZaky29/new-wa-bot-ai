import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Bot,
  RefreshCw,
  MessageSquare,
  Zap,
  ShieldCheck,
  Terminal
} from 'lucide-react';

// Hooks & Types
import { useWhatsApp } from './hooks/useWhatsApp';
import type { TabId } from './types';

// Components
import { StatusCard } from './components/StatusCard';
import { QRCodeSection } from './components/QRCodeSection';
import { LogMonitor } from './components/LogMonitor';
import { Dashboard } from './components/Dashboard';
import { PromptEditor } from './components/PromptEditor';
import { ContactManager } from './components/ContactManager';

const SESSION_ID = import.meta.env.VITE_WA_SESSION_ID || 'wa-bot-ai';

export default function App() {
  const {
    status,
    loading,
    globalStats,
    initializing,
    fetchStatus,
    handleInit,
    handleLogout
  } = useWhatsApp();

  const [activeTab, setActiveTab] = useState<TabId>('control');

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-fade-in px-2 md:px-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                WA-BOT-AI <span className="hidden sm:inline text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">ALPHA 1.1</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-medium">Auto-Response AI Assistant for WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={fetchStatus}
              className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition-all"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-8 w-[1px] bg-slate-800 mx-1"></div>
            <div className="flex-1 md:flex-none px-4 py-2 rounded-xl glass flex items-center justify-between md:justify-start gap-3 border border-slate-700/50 shadow-inner">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500 opacity-50'}`}></div>
                <span className="font-bold text-[10px] md:text-xs tracking-widest text-slate-400 uppercase">System Status</span>
              </div>
              <span className={`font-black text-xs tracking-wide ${status.isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {status.isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4 md:space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatusCard
              status={status}
              initializing={initializing}
              onInit={handleInit}
              onLogout={handleLogout}
              sessionId={SESSION_ID}
            />

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="glass-card rounded-2xl p-4 md:p-5 border border-slate-800/50">
                <Zap className="w-5 h-5 text-yellow-500 mb-2 md:mb-3" />
                <span className="block text-xl font-bold text-white tracking-widest leading-none mb-1">
                  {globalStats.requests}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Requests</span>
              </div>
              <div className="glass-card rounded-2xl p-4 md:p-5 border border-slate-800/50">
                <MessageSquare className="w-5 h-5 text-purple-500 mb-2 md:mb-3" />
                <span className="block text-xl font-bold text-white tracking-widest leading-none mb-1">
                  {globalStats.responses}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Responses</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-8 space-y-6 md:space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Tabs - Mobile Responsive */}
            <div className="overflow-x-auto no-scrollbar -mx-2 px-2 md:mx-0 md:px-0">
              <div className="flex gap-1.5 p-1 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 min-w-max">
                {[
                  { id: 'stats', label: 'Stats', icon: BarChart3 },
                  { id: 'control', label: 'Connect', icon: Bot },
                  { id: 'logs', label: 'Monitor', icon: Terminal },
                  { id: 'config', label: 'Security', icon: ShieldCheck }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === tab.id ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Dashboard />
                </motion.div>
              )}

              {activeTab === 'control' && (
                <motion.div
                  key="control"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <QRCodeSection status={status} />
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div
                  key="logs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <LogMonitor sessionId={SESSION_ID} />
                </motion.div>
              )}
              {activeTab === 'config' && (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <PromptEditor />
                  <div className="h-px bg-slate-800/50 w-full" />
                  <ContactManager />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <footer className="mt-16 text-center text-slate-600 text-xs font-medium uppercase tracking-[0.2em] animate-fade-in" style={{ animationDelay: '0.4s' }}>
          POWERED BY @GOOGLE/GEMINI • @WHISKEYSOCKETS/BAILEYS • SUPABASE PERSISTENCE
        </footer>
      </div>
    </div>
  );
}
