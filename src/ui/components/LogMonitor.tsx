import { Terminal } from 'lucide-react';

export function LogMonitor({ sessionId }: { sessionId: string }) {
    return (
        <div className="glass-card rounded-[2rem] p-0 overflow-hidden flex flex-col min-h-[500px]">
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
                <p className="text-cyan-500/70">{`> wa_gateway connected. session='${sessionId}'`}</p>
                <p className="text-blue-500/70">{`> bot is ready and listening.`}</p>
            </div>
        </div>
    );
}
