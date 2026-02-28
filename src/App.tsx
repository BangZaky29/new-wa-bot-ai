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

const SESSION_ID = import.meta.env.VITE_WA_SESSION_ID || 'wa-bot-ai';

export default function App() {
  const {
    status,
    loading,
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
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                WA-BOT-AI <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">ALPHA 1.0</span>
              </h1>
              <p className="text-slate-400 font-medium">Auto-Response AI Assistant for WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStatus}
              className="p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-10 w-[1px] bg-slate-800 mx-2"></div>
            <div className="px-5 py-2.5 rounded-xl glass flex items-center gap-3 border border-slate-700/50 shadow-inner">
              <div className={`w-2.5 h-2.5 rounded-full ${status.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500 opacity-50'}`}></div>
              <span className="font-bold text-sm tracking-wide">
                SYSTEM: {status.isConnected ? 'OPERATIONAL' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatusCard
              status={status}
              initializing={initializing}
              onInit={handleInit}
              onLogout={handleLogout}
              sessionId={SESSION_ID}
            />

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-[1.5rem] p-5">
                <Zap className="w-5 h-5 text-yellow-500 mb-3" />
                <span className="block text-xl font-bold text-white">0</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Requests</span>
              </div>
              <div className="glass-card rounded-[1.5rem] p-5">
                <MessageSquare className="w-5 h-5 text-purple-500 mb-3" />
                <span className="block text-xl font-bold text-white">0</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Responses</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-8 space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 max-w-fit">
              {[
                { id: 'stats', label: 'History & Stats', icon: BarChart3 },
                { id: 'control', label: 'Connection', icon: Bot },
                { id: 'logs', label: 'Monitor', icon: Terminal },
                { id: 'config', label: 'Security', icon: ShieldCheck }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
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
