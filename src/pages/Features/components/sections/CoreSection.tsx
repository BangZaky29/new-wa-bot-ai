import { Bot, Zap } from "lucide-react";
import { ToggleCard } from "../ToggleCard";
import type { SectionProps } from "../../types";

export function CoreSection({ controls, updateControl, userFeatures, isFeatureLocked }: SectionProps) {
  return (
    <section className="glass-card rounded-[2rem] p-8 border border-slate-800/50 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
          <Bot className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Core AI</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Respon bot & waktu respon
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
        Bagian ini adalah otak utama dari asisten. Anda dapat mengaktifkan atau menonaktifkan kecerdasan buatan (AI) secara penuh di sini, serta mengatur seberapa cepat bot akan merespon pesan untuk memberikan kesan natural layaknya manusia mengetik.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToggleCard
          title="AI Response"
          description={
            controls.is_ai_enabled
              ? "AI aktif merespon chat"
              : "AI sedang nonaktif"
          }
          enabled={controls.is_ai_enabled}
          locked={isFeatureLocked("is_ai_enabled")}
          onToggle={() =>
            !isFeatureLocked("is_ai_enabled") &&
            updateControl("is_ai_enabled", !controls.is_ai_enabled)
          }
        />

        <div className="p-6 rounded-3xl border bg-slate-800/30 border-slate-700/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white">
                {controls.response_delay_mins}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                MINS DELAY
              </span>
            </div>
          </div>
          <h4 className="font-black text-white text-sm mb-3 uppercase">
            Response Delay
          </h4>
          <input
            type="range"
            min={0}
            max={userFeatures?.max_delay_mins ?? 5}
            value={controls.response_delay_mins}
            onChange={(e) =>
              updateControl(
                "response_delay_mins",
                Math.min(
                  parseInt(e.target.value, 10),
                  userFeatures?.max_delay_mins ?? 5,
                ),
              )
            }
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between mt-2 text-[8px] font-black text-slate-600 uppercase">
            <span>Instant</span>
            <span>{userFeatures?.max_delay_mins ?? 5} Mins</span>
          </div>
        </div>
      </div>
    </section>
  );
}
