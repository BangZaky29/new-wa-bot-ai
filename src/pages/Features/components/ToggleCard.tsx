import { Sliders, Lock } from "lucide-react";

interface ToggleCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  locked?: boolean;
  badge?: React.ReactNode;
}

export function ToggleCard({
  title,
  description,
  enabled,
  onToggle,
  locked,
  badge,
}: ToggleCardProps) {
  const isActuallyEnabled = enabled && !locked;

  return (
    <div
      className={`p-6 rounded-3xl border transition-all relative ${
        isActuallyEnabled
          ? "bg-cyan-500/10 border-cyan-500/30"
          : "bg-slate-800/30 border-slate-700/30"
      } ${locked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={() => !locked && onToggle()}
    >
      {(badge || locked) && (
        <div className="absolute top-4 right-4 z-20">
          {badge || (
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
              <Lock className="w-2.5 h-2.5 text-slate-950 font-black" />
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            isActuallyEnabled ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-500"
          }`}
        >
          <Sliders className="w-5 h-5" />
        </div>
        <div
          className={`w-12 h-6 rounded-full relative transition-colors ${
            isActuallyEnabled ? "bg-cyan-500" : "bg-slate-700"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
              isActuallyEnabled ? "right-1" : "left-1"
            }`}
          ></div>
        </div>
      </div>
      <h4 className="font-black text-white text-sm mb-1 uppercase">{title}</h4>
      <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
        {description}
      </p>
    </div>
  );
}
