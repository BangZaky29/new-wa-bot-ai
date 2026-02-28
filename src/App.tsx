import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Settings,
  QrCode,
  MessageSquare,
  RefreshCw,
  Power,
  CheckCircle2,
  XCircle,
  Cpu,
  Zap,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import axios from 'axios';

// ============================================
// AI Bot UI Configurations
// ============================================

const WA_API_BASE = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';
const SESSION_ID = import.meta.env.VITE_WA_SESSION_ID || 'wa-bot-ai';

interface ConnectionStatus {
  success: boolean;
  status: 'open' | 'connecting' | 'waiting_qr' | 'close' | 'disconnected';
  isConnected: boolean;
  phoneNumber: string | null;
  hasQR: boolean;
  qr?: string;
  qrImage?: string;
  user?: {
    id: string;
    name: string;
  };
}

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>({
    success: false,
    status: 'disconnected',
    isConnected: false,
    phoneNumber: null,
    hasQR: false
  });
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'logs' | 'config'>('control');

  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${WA_API_BASE}/api/whatsapp/${SESSION_ID}/status`);
      const data = response.data;

      if (data.success) {
        setStatus(prev => ({
          ...prev,
          success: true,
          status: data.status,
          isConnected: data.isConnected,
          phoneNumber: data.phoneNumber,
          hasQR: data.hasQR
        }));

        // If it's waiting for QR and we don't have the image yet, fetch it
        if (data.hasQR) {
          fetchQR();
        }
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQR = async () => {
    try {
      const response = await axios.get(`${WA_API_BASE}/api/whatsapp/${SESSION_ID}/qr`);
      if (response.data.success && response.data.qrImage) {
        setStatus(prev => ({
          ...prev,
          qrImage: response.data.qrImage,
          hasQR: true
        }));
      }
    } catch (error) {
      console.error('Failed to fetch QR:', error);
    }
  };

  const handleInit = async () => {
    setInitializing(true);
    try {
      await axios.post(`${WA_API_BASE}/api/whatsapp/${SESSION_ID}/init`);
      setTimeout(fetchStatus, 2000);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    } finally {
      setInitializing(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to stop this bot?')) return;
    try {
      await axios.post(`${WA_API_BASE}/api/whatsapp/${SESSION_ID}/logout`);
      setStatus({
        success: false,
        status: 'disconnected',
        isConnected: false,
        phoneNumber: null,
        hasQR: false
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 selection:bg-cyan-500/30 font-sans">
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

          {/* Sidebar / Stats */}
          <aside className="lg:col-span-4 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Status Card */}
            <div className="glass-card rounded-[2rem] p-8">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> BOT INSTANCE STATUS
              </h3>

              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${status.isConnected ? 'border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'border-slate-700'}`}>
                    {status.isConnected ? (
                      <Power className="w-10 h-10 text-green-500" />
                    ) : (
                      <XCircle className="w-10 h-10 text-slate-600" />
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white capitalize">{status.status}</h2>
                <p className="text-slate-500 text-sm mt-1">{SESSION_ID}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                  <span className="text-slate-400 text-sm font-medium">Gateway</span>
                  <span className="text-cyan-400 text-sm font-bold">ONLINE</span>
                </div>
                {status.phoneNumber && (
                  <div className="flex justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                    <span className="text-slate-400 text-sm font-medium">Attached No</span>
                    <span className="text-white text-sm font-bold">+{status.phoneNumber}</span>
                  </div>
                )}
              </div>

              {!status.isConnected && !status.hasQR && (
                <button
                  onClick={handleInit}
                  disabled={initializing}
                  className="w-full mt-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <Cpu className={`w-5 h-5 group-hover:rotate-12 transition-transform ${initializing ? 'animate-spin' : ''}`} />
                  {initializing ? 'BOOTING...' : 'INITIALIZE SYSTEM'}
                </button>
              )}

              {status.isConnected && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
                >
                  <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  SHUTDOWN BOT
                </button>
              )}
            </div>

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

          {/* Main Content Area */}
          <main className="lg:col-span-8 space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 max-w-fit">
              {[
                { id: 'control', label: 'Dashboard', icon: Bot },
                { id: 'logs', label: 'Monitor', icon: Terminal },
                { id: 'config', label: 'Security', icon: ShieldCheck }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'control' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* QR Section */}
                  {status.hasQR ? (
                    <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center">
                      <div className="bg-white p-6 rounded-[2rem] shadow-2xl mb-8 relative">
                        <div className="absolute inset-0 bg-cyan-500/10 rounded-[2rem] animate-pulse-slow"></div>
                        <img src={status.qrImage} alt="QR Code" className="w-64 h-64 relative z-10" />
                      </div>
                      <h2 className="text-2xl font-black text-white mb-2">SCAN TO LINK BOT</h2>
                      <p className="text-slate-400 text-center max-w-md">
                        Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device.
                        Wait for the sync to complete.
                      </p>
                    </div>
                  ) : status.isConnected ? (
                    <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                      </div>
                      <h2 className="text-3xl font-black text-white mb-3 text-center uppercase tracking-tight">AI Engine Loaded</h2>
                      <p className="text-slate-400 text-center max-w-lg mb-8">
                        The AI bot is now listening for incoming messages on +{status.phoneNumber}.
                        Automation rules are active.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        <div className="p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                          <span className="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-widest">Uptime</span>
                          <span className="text-lg font-bold text-white">0h 0m</span>
                        </div>
                        <div className="p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                          <span className="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-widest">Efficiency</span>
                          <span className="text-lg font-bold text-white">99.9%</span>
                        </div>
                        <div className="p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                          <span className="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-widest">Memory</span>
                          <span className="text-lg font-bold text-white">12.5MB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50">
                        <QrCode className="w-16 h-16 text-slate-600" />
                      </div>
                      <h2 className="text-2xl font-black text-white mb-2 text-center">SYSTEM IDLE</h2>
                      <p className="text-slate-500 text-center max-w-md">
                        Please initialize the system using the sidebar button to generate a connection QR code.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card rounded-[2rem] p-0 overflow-hidden flex flex-col min-h-[500px]"
                >
                  <div className="px-8 py-6 border-b border-slate-800/50 bg-slate-900/30 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-cyan-500" />
                      AI ENGINE MONITOR
                    </h3>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                      <span className="w-2 h-2 rounded-full bg-yellow-500/50"></span>
                      <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                    </div>
                  </div>
                  <div className="p-8 font-mono text-sm space-y-2 text-slate-400 overflow-y-auto max-h-[400px]">
                    <p className="text-slate-500 italic">[{new Date().toLocaleTimeString()}] System: Waiting for activity...</p>
                    <p className="text-cyan-500/70">{`> initializing AI modules...`}</p>
                    <p className="text-cyan-500/70">{`> wa_gateway connected. session='${SESSION_ID}'`}</p>
                    <p className="text-blue-500/70">{`> bot is ready and listening.`}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-600 text-xs font-medium uppercase tracking-[0.2em] animate-fade-in" style={{ animationDelay: '0.4s' }}>
          POWERED BY @WHISKEYSOCKETS/BAILEYS • SUPABASE PERSISTENCE • VITE REACT TS
        </footer>
      </div>
    </div>
  );
}
